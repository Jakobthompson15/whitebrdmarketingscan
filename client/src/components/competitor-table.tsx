import { BusinessSuggestion } from '@/lib/types';

interface CompetitorTableProps {
  competitors: BusinessSuggestion[];
  targetBusinessId: string;
  marketPosition: number;
}

export function CompetitorTable({ competitors, targetBusinessId, marketPosition }: CompetitorTableProps) {
  // Sort competitors by competitive score (rating * review volume)
  const sortedCompetitors = [...competitors].sort((a, b) => {
    const scoreA = a.rating * Math.log10((a.reviewCount || 0) + 1);
    const scoreB = b.rating * Math.log10((b.reviewCount || 0) + 1);
    return scoreB - scoreA;
  });

  const calculateCompetitiveScore = (business: BusinessSuggestion): number => {
    const baseScore = (business.rating / 5) * 60;
    const reviewScore = Math.min(30, (business.reviewCount / 100) * 30);
    const presenceScore = (business.publicInfo.website ? 5 : 0) + (business.publicInfo.phone ? 5 : 0);
    return Math.round(baseScore + reviewScore + presenceScore);
  };

  return (
    <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 bg-white">
        <h3 className="text-lg font-bold text-black">Local Competitor Rankings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competitive Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-800">
            {sortedCompetitors.map((competitor, index) => {
              const isTarget = competitor.placeId === targetBusinessId;
              const rank = index + 1;
              
              return (
                <tr 
                  key={competitor.placeId} 
                  className={`hover:bg-gray-950 ${isTarget ? 'bg-[var(--color-data-orange-fade)]' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-[var(--color-data-orange)]">
                      #{rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {competitor.name}
                      {isTarget && <span className="text-[var(--color-data-orange)] text-xs ml-2">(YOU)</span>}
                    </div>
                    <div className="text-sm text-gray-500">{competitor.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-[var(--color-data-orange)] font-bold">
                      {competitor.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-[var(--color-data-orange)] font-bold">
                      {competitor.reviewCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-[var(--color-data-orange)] font-bold">
                      {calculateCompetitiveScore(competitor)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
