import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from './site.schema';
import { PublishSiteDto } from './dto';
import { PeopleService } from '../people/people.service';
import { htmlToSearchText, sanitizeSiteHtml } from '../sanitize';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly sites: Model<SiteDocument>,
    private readonly people: PeopleService,
  ) {}

  normalizeAddress(raw: string): string {
    return raw.trim().toLowerCase().replace(/^small:\/\//, '');
  }

  async list() {
    return this.sites
      .find()
      .populate('author', 'name')
      .sort({ address: 1 })
      .lean()
      .exec();
  }

  async findByAddress(raw: string) {
    const address = this.normalizeAddress(raw);
    return this.sites
      .findOne({ address })
      .populate('author', 'name')
      .lean()
      .exec();
  }

  /** Browse lookup — returns found or a structured miss (never 404 for typing). */
  async resolve(raw: string) {
    const address = this.normalizeAddress(raw);
    if (!address) {
      throw new BadRequestException('Address required');
    }
    const site = await this.findByAddress(address);
    if (!site) {
      return { found: false as const, address, site: null };
    }
    return { found: true as const, address, site };
  }

  async publish(dto: PublishSiteDto) {
    const address = this.normalizeAddress(dto.address);
    const author = await this.people.findById(dto.authorId);
    if (!author) throw new NotFoundException('Author not found');

    const existing = await this.sites.findOne({ address }).lean().exec();
    if (existing) {
      throw new ConflictException(`Address ${address} is already taken`);
    }

    const html = sanitizeSiteHtml(dto.html);
    const text = htmlToSearchText(html);
    if (!text) {
      throw new BadRequestException('Page needs readable text after sanitization');
    }

    const created = await this.sites.create({
      address,
      title: dto.title.trim(),
      html,
      text,
      author: author._id,
    });

    return this.sites
      .findById(created._id)
      .populate('author', 'name')
      .lean()
      .exec();
  }
}
