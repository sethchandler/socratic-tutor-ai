
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
**TEACHING GUIDE: *Hawkins v. McGee* (N.H. 1929)**  
*For the 1L Contracts Professor: From Black Letter Basics to the Tort-Contract Borderland*

---

## **I. CASE SNAPSHOT FOR STUDENTS**  
*"The Hairy Hand Case"*

**Facts:**  
11-year-old George Hawkins has a burned, scarred hand. Dr. McGee promises: "I've done this a hundred times. You'll be in the hospital 3-4 days, no more, and you'll have a *hundred percent perfect hand*." He grafts skin from the boy's chest. The result: a hand covered in thick chest hair, with reduced function and worse scarring—the "hairy hand."

**Procedural Posture:**  
Trial court awards $3,000 (likely based on pain and suffering). New Hampshire Supreme Court reverses and remands, holding jury instructions were wrong—this is a contract case, not a tort case.

**Holding:**  
When a physician makes a specific promise of result beyond the standard of care, it can constitute an enforceable contract. The proper measure of damages is **expectation damages**: the difference in value between the hand as promised ("perfect") and the hand as delivered ("hairy"), excluding pain and suffering.

---

## **II. TEACHING THE CORE DAMAGES CONCEPTS**  
*(1L Foundation Level)*

### **A. The Three Measures of Contract Damages**

Use this case to distinguish the three remedies:

1. **Expectation Damages (The Default)**  
   *"Benefit of the bargain"*  
   Places the plaintiff in the position they would have been in had the contract been performed.  
   **Formula:** Value of promised performance – Value of actual performance  
   *Hawkins:* Value of a "perfect hand" – Value of the hairy, defective hand  
   **Key Teaching Point:** This is *not* just "make me whole." It's "give me what you promised."

2. **Reliance Damages (The Safety Net)**  
   *"Make me whole"*  
   Returns plaintiff to their pre-contract position. Compensates for losses incurred in reasonable reliance.  
   **Formula:** Loss suffered due to reliance on the promise  
   *Hawkins would have been:* The *worsening* of his hand condition from the failed surgery, but **not** the loss of the promised perfect hand.  
   **When Used:** When expectation damages are too speculative or the contract was a "losing deal" for plaintiff.

3. **Restitution (The Unjust Enrichment Remedy)**  
   *"Give back what you got"*  
   Prevents defendant's unjust enrichment by returning benefit conferred.  
   **Formula:** Value of benefit conferred on defendant  
   *Hawkins would have been:* The value of the doctor's fee (or the value of the services performed).  
   **When Used:** When no enforceable contract exists or plaintiff prefers to unwind the transaction.

### **B. Why Expectation Damages Here?**

The court chose expectation damages because:
- **Certainty:** The promise was specific ("100% perfect hand"), making the expected value ascertainable
- **Bargain Preservation:** It enforces the parties' agreement rather than unraveling it
- **Default Rule:** Contract law presumes parties want the benefit of their bargain

### **C. The "Pain as Consideration" Rule (The 1L Gotcha)**

**Court's Logic:** "The pain was part of the price paid for the contract."  
**Translation:** Hawkins voluntarily underwent pain to obtain the promised perfect hand. The pain was a *legal detriment* that formed consideration, not a *damage* from breach. This is counterintuitive—students must understand that contract damages focus on the *gap between promise and performance*, not the *cost of performance*.

**Hypothetical Test:** If Dr. McGee had promised a "pain-free perfect hand," then pain could be a damage. But he only promised the *outcome*, not the *process*.

---

## **III. THE STRATEGIC CALCULUS**  
*(Intermediate: Why the Plaintiff Was Right to Stick with Contract)*

### **A. Why Not Waive Contract and Proceed in Tort?**

**Short Answer: He couldn't.** The tort claim was procedurally dead. As revealed in advanced commentary, "the trial judge dismissed the tort count, and the patient's lawyer dropped the matter". But even if viable, contract offered decisive advantages:

| **Factor** | **Contract Claim** | **Tort Claim (Malpractice)** |
|------------|-------------------|------------------------------|
| **Standard of Proof** | Breach of promise (objective) | Deviation from standard of care (subjective, complex) |
| **Expert Witnesses** | Not required | **Absolutely required**—and nearly impossible to obtain |
| **Jury Appeal** | Simple: "He promised X, delivered Y" | Complex medical testimony |
| **Professional "Code of Silence"** | Irrelevant | **Fatal**: Doctors rarely testify against colleagues |

**Key Teaching Point:** The contract claim was Hawkins' *only* path to recovery. Waiving it meant zero compensation.

### **B. The Damages Trade-Off**

**The Hard Choice:**  
- **Contract:** Certain win, but limited to expectation damages (no pain & suffering)  
- **Tort:** Uncertain win, but full compensatory damages (including pain & suffering, emotional distress, loss of enjoyment)

**Strategic Reality:** A smaller certain recovery beats a larger speculative one. The parties eventually **settled for $1,400** before retrial, suggesting Hawkins' lawyer knew contract damages would be modest but certain.

---

## **IV. THE BORDERLAND DEEP DIVE**  
*(Advanced/Health Law Level: The Case's Dark Legacy)*

This case exposes three critical tensions at the tort-contract borderland:

### **A. The Insurance Coverage Gap (The Hidden Landmine)**

Dr. McGee's malpractice insurer disclaimed coverage for the contract claim, arguing policies cover **negligence**, not **guarantees**. This reveals:

- **Pricing Assumption:** Insurance premiums are calculated on tort liability (reasonable care), not contractual warranties
- **Doctor's Risk:** When physicians "overpromise," they may be **personally liable** beyond their insurance
- **Patient's Risk:** Patients assume their doctor's promises are backed by insurance—often false

**Discussion Question:** Should insurers be required to cover contractual promises? Or should doctors be prohibited from making promises that void coverage?

### **B. Perverse Incentives: The Law Rewards Recklessness**

The damages rule creates a backward incentive structure:

- **Low-Quality Doctors** (who recklessly promise "100% cures") face **limited contract damages** (value gap)
- **Cautious Doctors** (who make no promises) face **unlimited tort liability** (full harm)
- **Result:** The law *penalizes* honest communication and *rewards* snake-oil salesmanship

**Modern Parallel:** Cosmetic surgery clinics promising "guaranteed results" exploit this gap.

### **C. The Categorical Mismatch: Medicine Is Neither Pure Tort Nor Pure Contract**

The court analogized the case to a **machine warranty**, but medical relationships have unique features:

| **Feature** | **Commercial Contract** | **Medical Relationship** | **Legal Implication** |
|-------------|------------------------|--------------------------|----------------------|
| **Bargaining Power** | Roughly equal | **Grossly unequal** (pain, fear, information asymmetry) | Should strict contract rules apply? |
| **Consent** | Rational calculation | **Vulnerable reliance** | Does true "assent" exist? |
| **Professional Duty** | Caveat emptor | **Fiduciary duty** (trust, disclosure) | Contract terms shouldn't override fiduciary duties |
| **Damages Certainty** | Market value exists | **Incredibly speculative** (what's a "perfect hand" worth?) | Expectation damages are unpredictable |

**Health Law Extension:** Modern courts recognize this hybrid nature. *Sullivan v. O'Connor* (Mass. 1973) later allowed recovery under *both* theories, awarding expectation damages *plus* pain and suffering for the breach itself, recognizing that medical promises create a "special relationship" that defies pure categorization.

---

## **V. CLASSROOM PEDAGOGY**

### **A. For 1L Students: The Black Letter Drill**

**Key Distinction:**  
- **Tort:** "Make me whole for the harm you caused me" (compensatory, backward-looking)  
- **Contract:** "Give me the benefit you promised" (performance-oriented, forward-looking)

**Multiple Choice Trap:**  
"Under *Hawkins*, can a patient recover for pain and suffering from a botched surgery?"  
- **Wrong Answer:** "No, never."  
- **Right Answer:** "No *in contract*, but yes *in tort*—if the tort claim is viable."

**Hypothetical:** Doctor promises "You'll see 20/20 vision after LASIK." Patient ends up with 20/40 vision and severe dry eye pain. Under contract theory, what are the damages?  
**Answer:** The value of 20/20 vision minus value of 20/40 vision. The dry eye pain? **Not recoverable** under contract—it's part of the "price paid" for the promised outcome.

### **B. For Advanced Students: The Policy Critique**

**Discussion Questions:**
1. **Professional Speech:** If doctors' promises are enforceable contracts, should bar associations discipline attorneys who make outcome guarantees? Why the double standard?
2. **Information Asymmetry:** Should courts apply a "reasonable patient" or "reasonable physician" standard to interpret medical promises?
3. **Insurance Regulation:** Should states mandate that medical malpractice insurance cover contractual warranties to close the coverage gap?

**Health Law Connection:**  
In modern **informed consent** law, doctors must disclose material risks. A promise of "perfect results" could be seen as *fraudulent* if the doctor knows it's unrealistic. Should there be a tort of **"fraudulent promise"** that bridges the gap?

### **C. Common Student Misconceptions to Address**

-  **"This is a medical malpractice case."**  **Correction:** It's *not* malpractice—it's breach of a specific promise. Distinguish "failure to exercise reasonable care" (tort) from "failure to achieve promised result" (contract).
-  **"The court was unfair to the boy."**  **Correction:** The court enforced contract doctrine neutrally. The "unfairness" is in the *doctrine itself*, not its application.
-  **"Doctors can't be sued in contract."**  **Correction:** They can, and often *should* be when they make specific promises. The limitation is in *damages*, not liability.

---

## **VI. SYNTHESIS: THE CASE'S ENDURING LESSON**

*Hawkins v. McGee* is more than a damages case. It's a **cautionary tale about legal categorization**:

1. **For Students:** It teaches that **remedy determines rights**. The measure of damages *is* the substantive law.

2. **For Practitioners:** It reveals that **procedural posture is strategic**. The viability of a claim depends not just on legal theory but on **evidentiary realities** (expert witnesses) and **financial backstops** (insurance).

3. **For Policymakers:** It exposes that **medicine lives in a legal borderland** where contract and tort are inadequate alone. The modern trend is toward **hybrid liability**—allowing contract claims but permitting tort damages where appropriate, as in *Sullivan v. O'Connor*.

**Final Exam Tip:** When a fact pattern involves a **specific promise** by a professional, always discuss **both** contract and tort theories. Flag the *Hawkins* rule: contract damages are limited to expectation, but tort may be blocked by procedural hurdles. The best answer explores the borderland, not just one side of it.

---

**Endnote for Professor:** The case's true pedagogical value lies not in its holding, but in its **silences**: Why did Dr. McGee make such a reckless promise? Why did Hawkins' family accept it? What does it say about a system where the law's categories **fail to match human experience**? Push advanced students to see that *Hawkins* isn't just about damages—it's about the limits of legal formalism in regulating trust-based relationships.
`;

export const GEMINI_AUDIO_INPUT_PRICE_PER_SECOND = 0.0001;
export const GEMINI_AUDIO_OUTPUT_PRICE_PER_SECOND = 0.0002;
export const GEMINI_PRICING_URL = 'https://ai.google.dev/gemini-api/pricing';
