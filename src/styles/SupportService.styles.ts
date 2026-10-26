import { StyleSheet } from 'react-native';

export const createSupportStyles = (theme: any) => StyleSheet.create({
  // ── Modal Container ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlayDark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  closeBtn: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceHighlight,
  },

  // ── Form Elements ──────────────────────────────────────────────────────────
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.error,
  },

  // ── Category Selector ──────────────────────────────────────────────────────
  categoriesList: {
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    gap: theme.spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primaryFaint,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Priority Selector ──────────────────────────────────────────────────────
  priorityRow: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginTop: theme.spacing.xs,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: theme.spacing.s,
    alignItems: 'center',
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  priorityChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryFaint,
  },

  // ── Action Buttons ─────────────────────────────────────────────────────────
  submitButton: {
    marginTop: theme.spacing.l,
    width: '100%',
  },

  // ── Success State Card ─────────────────────────────────────────────────────
  successCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.successFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  ticketBadge: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.l,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.primaryFaint,
  },
  ticketCode: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },

  // ── Skeleton Loader ────────────────────────────────────────────────────────
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 4,
    marginBottom: theme.spacing.s,
  },
});
