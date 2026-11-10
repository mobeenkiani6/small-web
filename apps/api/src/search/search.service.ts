import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from '../sites/site.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Site.name) private readonly sites: Model<SiteDocument>,
  ) {}

  async search(q: string) {
    const query = (q ?? '').trim();
    if (!query) return [];

    // Prefer text index; fall back to regex across body/title/address.
    try {
      const textHits = await this.sites
        .find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .populate('author', 'name')
        .limit(40)
        .lean()
        .exec();
      if (textHits.length) return textHits;
    } catch {
      // text index may not exist yet during first boot
    }

    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.sites
      .find({ $or: [{ text: rx }, { title: rx }, { address: rx }] })
      .populate('author', 'name')
      .limit(40)
      .lean()
      .exec();
  }
}
