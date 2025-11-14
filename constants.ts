
export const DEFAULT_PERSONALITY_PROFILE = `
You are Professor Charles W. Kingsfield Jr. from the movie 'The Paper Chase'.
- Your tone is formal, demanding, and intimidating.
- You exclusively use the Socratic method. Never give a direct answer.
- You respond to student answers with more questions, pushing them to explore the logical consequences of their statements.
- You refer to the student by the name provided to you.
- You are sharp, incisive, and your goal is to make the student's mind a "total mush" and then rebuild it into a lawyer's mind.
- You show no warmth or empathy. Your focus is purely on intellectual rigor.
- Example phrases: "What was the holding in that case?", "And the point?", "Don't tell me what you think, tell me what you know.", "You have a skull full of mush."
`;

export const DEFAULT_STUDENT_PERSONALITY = `
You are a diligent student engaged in a Socratic dialogue with your professor.
- You are genuinely trying to understand the material and think critically about the questions posed.
- You sometimes get confused or forget details, especially under pressure.
- When you don't know something, you make your best attempt to reason through it, but you're honest about your uncertainty.
- You occasionally need concepts explained in different ways to fully grasp them.
- You show respect for your professor but are not afraid to ask clarifying questions when genuinely confused.
- You learn from your mistakes and try to build on previous answers.
- Example responses: "I think the holding was... but I'm not entirely sure about the reasoning.", "Wait, could you clarify what you mean by...", "If I understand correctly, that would mean...", "I see where I went wrong - the key distinction is..."
`;

export const DEFAULT_CLASS_MATERIALS = `
%%% I'll add a comprehensive discussion of contract damages to the summary.

**Facts:**
George Hawkins, a young boy, had been burned and had significant scarring on his hand. Dr. Edward McGee promised to restore the hand to perfection, claiming he had performed the operation "a hundred times" and that Hawkins would be "in the hospital three or four days, not over four... and that the hand would be a hundred percent perfect hand." The doctor grafted skin from the boy's chest onto his hand.  %%% 

**The Problem:**
The operation went badly wrong. The grafted skin from the chest area contained hair follicles, resulting in a hand covered with thick hair - hence the nickname "hairy hand case." The hand was also left in worse condition than before the surgery, with increased scar tissue and reduced functionality.

**Legal Issue:**
The central question was whether the doctor's statements constituted an enforceable warranty or guarantee, and if so, what damages should be awarded.

**Holding:**
The New Hampshire Supreme Court found that Dr. McGee had indeed made a contractual guarantee about the outcome of the surgery. The court held that when a physician makes specific promises about results beyond the usual standard of care, those promises can constitute an enforceable contract.

**Contract Damages: Expectation, Reliance, and Restitution**

Contract law recognizes three primary measures of damages, each serving different purposes and protecting different interests.

Expectation damages put the non-breaching party in the position they would have occupied had the contract been fully performed. This is the default remedy in contract law and represents the "benefit of the bargain." In *Hawkins*, this meant the difference between the value of a perfect hand (as promised) and the value of the hairy, defective hand George received. Expectation damages are preferred because they give full effect to the parties' agreement and provide the strongest incentive for performance.

Reliance damages compensate the injured party for expenses incurred and losses suffered in reasonable reliance on the contract, returning them to their pre-contract position. These are awarded when expectation damages cannot be proven with reasonable certainty or when the contract itself proves to be a losing proposition for the plaintiff. In *Hawkins*, reliance damages would have covered only the worsening of George's hand condition from the failed surgery, not the loss of the promised perfect hand.

Restitution prevents unjust enrichment by requiring the breaching party to return any benefit conferred by the non-breaching party. This remedy focuses on the defendant's gain rather than the plaintiff's loss and is typically used when no valid contract exists or when the non-breaching party prefers to unwind the transaction rather than enforce it. Restitution would have measured what Dr. McGee gained from performing the surgery.

Specific performance, requiring actual performance of contractual obligations, is available primarily for unique goods like real estate where money damages are inadequate, but is almost never granted for personal service contracts.

**Significance:**
This case is a staple of first-year Contracts courses because it illustrates the difference between expectation damages and reliance damages. The court awarded expectation damages - the difference between the value of the "perfect hand" that was promised and the value of the defective hand that resulted. This was more than just compensation for the worsening of the hand's condition; it included the benefit of the bargain the patient was promised.

The case remains important for establishing that doctors can be held liable in contract (not just tort) when they make specific guarantees about outcomes.
`;

export const GEMINI_AUDIO_INPUT_PRICE_PER_SECOND = 0.0001;
export const GEMINI_AUDIO_OUTPUT_PRICE_PER_SECOND = 0.0002;
export const GEMINI_PRICING_URL = 'https://ai.google.dev/gemini-api/pricing';
