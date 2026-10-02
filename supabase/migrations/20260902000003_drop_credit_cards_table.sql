-- ==============================================================================
-- Migration: Drop credit_cards table (Policy Compliance)
-- Description:
-- Buddy is a personal finance tracker, not a payment or banking app.
-- Storing raw card numbers, CVVs, or expiration dates violates App Store &
-- Play Store PCI compliance and policy guidelines.
-- This migration permanently drops public.credit_cards and all associated policies.
-- ==============================================================================

DROP TABLE IF EXISTS public.credit_cards CASCADE;
