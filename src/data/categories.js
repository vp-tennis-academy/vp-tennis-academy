// Shared utility for dynamic categories stored in localStorage

export const DEFAULT_BATCHES = ['Morning', 'Evening', 'Weekend'];
export const DEFAULT_EXPENSE_CATEGORIES = ['Equipment', 'Maintenance', 'Salary', 'Utilities', 'Other'];

export function getCategories() {
    try {
        const stored = JSON.parse(localStorage.getItem('vp_categories') || '{}');
        return {
            batches: stored.batches?.length ? stored.batches : DEFAULT_BATCHES,
            expenseCategories: stored.expenseCategories?.length ? stored.expenseCategories : DEFAULT_EXPENSE_CATEGORIES,
        };
    } catch {
        return { batches: DEFAULT_BATCHES, expenseCategories: DEFAULT_EXPENSE_CATEGORIES };
    }
}

export function saveCategories(cats) {
    localStorage.setItem('vp_categories', JSON.stringify(cats));
}
