import { Brand, IBrand } from '../models/brand.model';
import { BrandLocation } from '../models/brand-location.model';
import { Evidence } from '../models/evidence.model';
import { ReadinessGap } from '../models/readiness-gap.model';
import { ReadinessGate } from '../models/readiness-gate.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { GATE_TYPES } from '../config/constants';
import mongoose from 'mongoose';

export class BrandService {
  static async createBrand(data: Partial<IBrand>, actor: any) {
    const brand = new Brand(data);
    await brand.save();

    // Initialize the 4 mandatory approval gates for this brand
    for (const gateType of GATE_TYPES) {
      await ReadinessGate.create({
        brandId: brand._id,
        gateType,
        status: 'pending',
        blockingReasons: ['Initial assessment required before gate review.'],
      });
    }

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'BRAND_CREATED',
      targetEntity: 'brand',
      targetId: brand._id as any,
      newState: brand.toObject(),
    });

    return brand;
  }

  static async listBrands(filter: any = {}) {
    return Brand.find(filter)
      .populate('assignedAdviserId', 'name email')
      .sort({ updatedAt: -1 });
  }

  static async getBrandById(id: string, actor: any) {
    const brand = await Brand.findById(id).populate('assignedAdviserId', 'name email');
    if (!brand) {
      throw new AppError('Brand engagement not found', 404);
    }
    return brand;
  }

  static async updateBrand(id: string, data: Partial<IBrand>, actor: any) {
    const brand = await Brand.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    const prev = brand.toObject();
    Object.assign(brand, data);
    await brand.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'BRAND_UPDATED',
      targetEntity: 'brand',
      targetId: brand._id as any,
      previousState: prev,
      newState: brand.toObject(),
    });

    return brand;
  }

  // Locations / Outlets
  static async getLocations(brandId: string) {
    return BrandLocation.find({ brandId }).sort({ openingDate: -1 });
  }

  static async addLocation(brandId: string, data: any, actor: any) {
    const loc = new BrandLocation({ ...data, brandId });
    await loc.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'BRAND_LOCATION_ADDED',
      targetEntity: 'brand',
      targetId: brandId,
      newState: loc.toObject(),
    });

    return loc;
  }

  // Evidence Register
  static async getEvidenceList(brandId: string) {
    return Evidence.find({ entityType: 'brand', entityId: brandId })
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async addEvidence(brandId: string, fileData: any, claimData: any, actor: any) {
    const evidence = new Evidence({
      entityType: 'brand',
      entityId: brandId,
      claim: claimData.claim,
      category: claimData.category,
      fileName: fileData.filename || fileData.originalname,
      fileUrl: `/uploads/${fileData.filename || fileData.originalname}`,
      fileSizeBytes: fileData.size || 0,
      mimeType: fileData.mimetype || 'application/octet-stream',
      uploadedBy: actor.userId,
      confidentialityLevel: claimData.confidentialityLevel || 'internal_only',
      verificationStatus: 'self_reported',
      notes: claimData.notes,
    });
    await evidence.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'EVIDENCE_UPLOADED',
      targetEntity: 'evidence',
      targetId: evidence._id as any,
      newState: evidence.toObject(),
    });

    return evidence;
  }

  static async verifyEvidence(
    brandId: string,
    evidenceId: string,
    status: 'supported_by_evidence' | 'reviewed_by_adviser' | 'unresolved',
    notes: string,
    actor: any
  ) {
    const evidence = await Evidence.findOne({ _id: evidenceId, entityId: brandId });
    if (!evidence) throw new AppError('Evidence not found', 404);

    const prev = evidence.verificationStatus;
    evidence.verificationStatus = status;
    evidence.verifiedBy = actor.userId;
    evidence.verifiedAt = new Date();
    if (notes) evidence.notes = notes;
    await evidence.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'EVIDENCE_VERIFIED',
      targetEntity: 'evidence',
      targetId: evidence._id as any,
      previousState: { verificationStatus: prev },
      newState: { verificationStatus: status, notes },
    });

    return evidence;
  }

  // Readiness Gaps
  static async getGaps(brandId: string) {
    return ReadinessGap.find({ brandId })
      .populate('assignedTo', 'name email')
      .populate('closedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async addGap(brandId: string, data: any, actor: any) {
    const gap = new ReadinessGap({
      brandId,
      dimension: data.dimension,
      title: data.title,
      description: data.description,
      severity: data.severity || 'high',
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      status: 'open',
    });
    await gap.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'READINESS_GAP_LOGGED',
      targetEntity: 'readiness_gap',
      targetId: gap._id as any,
      newState: gap.toObject(),
    });

    return gap;
  }

  static async updateGap(brandId: string, gapId: string, updateData: any, actor: any) {
    const gap = await ReadinessGap.findOne({ _id: gapId, brandId });
    if (!gap) throw new AppError('Readiness gap not found', 404);

    if (updateData.status === 'closed' && gap.status !== 'closed') {
      gap.status = 'closed';
      gap.closureNotes = updateData.closureNotes || 'Closed by adviser review.';
      gap.closedBy = actor.userId;
      gap.closedAt = new Date();
    } else {
      if (updateData.status) gap.status = updateData.status;
      if (updateData.closureNotes) gap.closureNotes = updateData.closureNotes;
      if (updateData.assignedTo) gap.assignedTo = updateData.assignedTo;
      if (updateData.dueDate) gap.dueDate = updateData.dueDate;
    }

    await gap.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'READINESS_GAP_UPDATED',
      targetEntity: 'readiness_gap',
      targetId: gap._id as any,
      newState: gap.toObject(),
    });

    return gap;
  }
}
