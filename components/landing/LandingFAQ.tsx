"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "What is Digital Credit Compass?",
    answer:
      "Digital Credit Compass (DCC) is an independent planning and analysis platform that helps you model Bitcoin-backed, fiat, and stablecoin income structures with transparent risk scoring. We provide tools for scenario modeling and suitability reports without custody or execution.",
  },
  {
    question: "Is DCC giving investment advice?",
    answer:
      "No. DCC is a planning tool that provides risk intelligence and scenario modeling. We do not provide investment advice, custody services, or execute transactions. Always consult with qualified financial advisors before making investment decisions.",
  },
  {
    question: "Does DCC hold or move my money?",
    answer:
      "No. DCC is a planning and analysis platform only. We do not custody Bitcoin, hold fiat currency, or execute transactions. All modeling is done independently of any financial institution or custodian.",
  },
  {
    question: "Are yields or income guaranteed?",
    answer:
      "No. All yields, rates, and projections shown are for modeling purposes only. Actual returns will vary and past performance does not guarantee future results. DCC presents risk scores to help you evaluate potential downside scenarios.",
  },
  {
    question: "Why does DCC show risk before yield?",
    answer:
      "We believe risk clarity comes before capital deployment. Our platform prioritizes transparent risk scoring so you can understand potential downsides before being attracted by yields. This approach helps with more informed financial planning.",
  },
  {
    question: "Who is DCC for?",
    answer:
      "DCC is designed for Bitcoin holders, financial planners, family offices, and anyone seeking to model digital income strategies with proper risk assessment. It's ideal for those who want clarity and transparency before committing capital.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            Frequently Asked <span className="text-[var(--primary)]">Questions</span>
          </h2>
        </div>
        <div className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.question}
              className="rounded-xl border border-border bg-surface-card shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-text-primary transition-colors hover:bg-surface-hover"
                aria-expanded={openIndex === i}
              >
                {item.question}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-border px-5 py-4 text-sm text-text-secondary">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
