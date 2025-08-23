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
          <div className="space-y-3">
            {seoData.keywordsNotRankingFor.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-sm text-orange-900 mb-2">
                  🎯 Target High-Value Keywords
                </div>
                <div className="text-xs text-orange-800 mb-2">
                  <strong>Priority Keywords:</strong> {seoData.keywordsNotRankingFor.slice(0, 3).map(k => k.keyword).join(', ')}
                </div>
                <div className="text-xs text-orange-700">
                  <strong>Action Steps:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Create dedicated service pages for each keyword</li>
                    <li>Add location-specific content highlighting local expertise</li>
                    <li>Include customer testimonials from the target area</li>
                  </ul>
                </div>
              </div>
            )}
            
            {seoData.seoMetrics.backlinks !== undefined && seoData.seoMetrics.backlinks < 100 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-sm text-blue-900 mb-2">
                  🔗 Build Authority Through Backlinks
                </div>
                <div className="text-xs text-blue-800 mb-2">
                  <strong>Current Status:</strong> {seoData.seoMetrics.backlinks} backlinks (Target: 100+)
                </div>
                <div className="text-xs text-blue-700">
                  <strong>Action Steps:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Get listed in local business directories</li>
                    <li>Partner with suppliers for mutual linking</li>
                    <li>Create shareable content like project galleries</li>
                    <li>Join local chamber of commerce for citations</li>
                  </ul>
                </div>
              </div>
            )}
            
            {(!seoData.seoMetrics.organicKeywords || seoData.seoMetrics.organicKeywords < 50) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-semibold text-sm text-purple-900 mb-2">
                  🚀 Expand Organic Reach
                </div>
                <div className="text-xs text-purple-800 mb-2">
                  <strong>Current Keywords:</strong> {seoData.seoMetrics.organicKeywords || 0} (Target: 50+)
                </div>
                <div className="text-xs text-purple-700">
                  <strong>Action Steps:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Create content for "[Service] near me" searches</li>
                    <li>Target neighborhood-specific pages</li>
                    <li>Add FAQ sections for common customer questions</li>
                    <li>Optimize for voice search with natural language</li>
                  </ul>
                </div>
              </div>
            )}
            
            {seoData.keywordsRankingFor.length > 0 && seoData.keywordsRankingFor.some(k => k.position > 3) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-sm text-green-900 mb-2">
                  ✨ Improve Existing Rankings
                </div>
                <div className="text-xs text-green-800 mb-2">
                  <strong>Keywords to Optimize:</strong> {seoData.keywordsRankingFor.filter(k => k.position > 3).slice(0, 3).map(k => `${k.keyword} (#${k.position})`).join(', ')}
                </div>
                <div className="text-xs text-green-700">
                  <strong>Action Steps:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Update meta titles and descriptions</li>
                    <li>Add more relevant content to ranking pages</li>
                    <li>Improve page load speed and mobile experience</li>
                    <li>Build internal links from high-authority pages</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}