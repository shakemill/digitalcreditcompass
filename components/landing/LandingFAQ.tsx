"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS: { question: string; answer: string[] }[] = [
  {
    question: "What is Digital Credit Compass?",
    answer: [
      "Digital Credit Compass (DCC) is an independent planning and analysis platform designed to help users model and compare Bitcoin-backed, fiat, and stablecoin income structures.",
      "The platform provides standardized risk scoring, scenario modeling tools, and professional risk analysis reports to help users evaluate yield strategies with greater transparency.",
      "DCC does not hold assets or execute transactions.",
    ],
  },
  {
    question: "Why Digital Credit Compass Exists",
    answer: [
      "The 2022 crypto credit crisis exposed major weaknesses in the digital lending market, when several large platforms collapsed and billions in investor capital were affected. One key issue was the lack of standardized tools to evaluate counterparty risk, collateral structures, and liquidity conditions across lending providers.",
      "Digital Credit Compass was created to address this gap.",
      "DCC provides an independent analytical framework that allows users to model income strategies across Bitcoin-backed lending, fiat yield instruments, and stablecoin structures using standardized risk scoring and scenario analysis.",
      "Rather than promoting yield opportunities, the platform prioritizes risk transparency. By presenting comparable data, stress-tested scenarios, and structured risk analysis reports, DCC helps users evaluate strategies with greater clarity before allocating capital.",
    ],
  },
  {
    question: "Is DCC providing investment advice?",
    answer: [
      "No. Digital Credit Compass is a planning and analysis platform that provides risk intelligence and scenario modeling tools.",
      "DCC does not provide investment advice, portfolio management, custody services, or transaction execution.",
      "Users should always consult qualified financial or legal advisors before making investment decisions.",
    ],
  },
  {
    question: "Does DCC hold or move my money?",
    answer: [
      "No. DCC does not custody digital assets, hold fiat currency, or move funds.",
      "The platform operates purely as an independent analytical environment where users can model strategies and evaluate risk before interacting with external providers.",
    ],
  },
  {
    question: "Are yields or income guaranteed?",
    answer: [
      "No. Any yields, rates, or income projections shown within the platform are for modeling and illustrative purposes only.",
      "Actual returns may vary significantly depending on market conditions, provider performance, and risk factors. Past performance does not guarantee future results.",
      "DCC provides risk scoring to help users evaluate potential downside scenarios before allocating capital.",
    ],
  },
  {
    question: "Why does DCC prioritize risk before yield?",
    answer: [
      "DCC is built on the principle that risk clarity should precede yield decisions.",
      "Many digital lending failures occurred because investors focused on yield without understanding underlying risk. By presenting transparent risk scores alongside yield metrics, DCC helps users evaluate strategies with a more disciplined and informed approach.",
    ],
  },
  {
    question: "Who is DCC designed for?",
    answer: [
      "DCC is designed for investors, capital allocators who want to evaluate digital income strategies with structured risk analysis.",
      "The platform is particularly useful for users seeking greater transparency before committing capital to Bitcoin-backed lending, fiat yield strategies, or stablecoin income structures.",
    ],
  },
  {
    question: "How does DCC generate its risk scores?",
    answer: [
      "Digital Credit Compass evaluates providers using a structured scoring framework that assesses factors such as transparency, risk management practices, liquidity conditions, and jurisdictional or regulatory environment.",
      "The specific scoring criteria and weightings may vary depending on the planner or strategy being analyzed (for example, Bitcoin-backed lending, fiat yield structures, or stablecoin strategies).",
      "Each provider receives a composite score designed to support consistent comparison across platforms.",
      "Detailed scoring criteria, assumptions, and methodology are fully documented in the Risk Methodology section available in the platform menu.",
    ],
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            Understanding Digital <span className="text-[var(--primary)]">Credit Compass</span>
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
                  {item.answer.map((para, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
