export interface ComboQuestion {
  id: string;
  text: string;
  category: string;
  categoryLabel: string;
}

// Simple module-level store — survives navigation, resets on app restart
export const comboStore = {
  questions: [] as ComboQuestion[],

  has(id: string): boolean {
    return this.questions.some((q) => q.id === id);
  },

  toggle(question: ComboQuestion) {
    if (this.has(question.id)) {
      this.questions = this.questions.filter((q) => q.id !== question.id);
    } else {
      this.questions = [...this.questions, question];
    }
  },

  remove(id: string) {
    this.questions = this.questions.filter((q) => q.id !== id);
  },

  clear() {
    this.questions = [];
  },

  get count() {
    return this.questions.length;
  },
};
