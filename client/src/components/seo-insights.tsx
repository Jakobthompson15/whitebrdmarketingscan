import { EnhancedSeoData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Search, Target } from 'lucide-react';

interface SeoInsightsProps {
  seoData: EnhancedSeoData;
  businessName: string;
}

export function SeoInsights({ seoData, businessName }: SeoInsightsProps) {
  return (
    <div className="space-y-6">
      {/* SEO Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Domain Authority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-data-orange)]">
              {seoData.seoMetrics.domainAuthority || 'N/A'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Backlinks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-data-orange)]">
              {seoData.seoMetrics.backlinks?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Organic Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-data-orange)]">
              {seoData.seoMetrics.organicKeywords?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Organic Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-data-orange)]">
              {seoData.seoMetrics.organicTraffic?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Currently Ranking For */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Keywords You're Ranking For
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seoData.keywordsRankingFor.length > 0 ? (
              <div className="space-y-3">
                {seoData.keywordsRankingFor.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{keyword.keyword}</div>
                      <div className="text-xs text-gray-500">
                        {keyword.searchVolume.toLocaleString()} monthly searches
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      #{keyword.position}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No ranking keywords found</p>
                <p className="text-xs">This could mean limited website presence</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keywords Missing Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Missed Keyword Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seoData.keywordsNotRankingFor.length > 0 ? (
              <div className="space-y-3">
                {seoData.keywordsNotRankingFor.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{keyword.keyword}</div>
                      <div className="text-xs text-gray-500">
                        {keyword.searchVolume.toLocaleString()} monthly searches
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        {keyword.topCompetitor} ranks #{keyword.competitorPosition}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Opportunity
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No missed opportunities found</p>
                <p className="text-xs">You're competing well in your market</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Action Items for {businessName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {seoData.keywordsNotRankingFor.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-sm text-orange-900">
                  📈 Target High-Value Keywords
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  Focus on: {seoData.keywordsNotRankingFor.slice(0, 3).map(k => k.keyword).join(', ')}
                </div>
              </div>
            )}
            
            {seoData.seoMetrics.backlinks && seoData.seoMetrics.backlinks < 100 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-sm text-blue-900">
                  🔗 Build More Backlinks
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Current: {seoData.seoMetrics.backlinks} backlinks - aim for 100+ for better authority
                </div>
              </div>
            )}
            
            {(!seoData.seoMetrics.organicKeywords || seoData.seoMetrics.organicKeywords < 50) && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-sm text-purple-900">
                  🎯 Expand Keyword Portfolio
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  Target more service + location combinations to increase visibility
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}