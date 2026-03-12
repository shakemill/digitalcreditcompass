import { YieldBoard } from "@/components/yield-board/YieldBoard";
import type { PlannerType } from "@/types/yieldboard";

type PageProps = {
  params: Promise<{ type: string }>;
};

const VALID_TYPES: PlannerType[] = ["btc", "stablecoin", "fiat"];

export default async function YieldBoardPage({ params }: PageProps) {
  const { type } = await params;
  const validType: PlannerType = VALID_TYPES.includes(type as PlannerType)
    ? (type as PlannerType)
    : "btc";

  return (
    <div className="-m-6 min-h-full min-w-0 overflow-x-hidden lg:-m-8">
      <YieldBoard initialTab={validType} />
    </div>
  );
}
