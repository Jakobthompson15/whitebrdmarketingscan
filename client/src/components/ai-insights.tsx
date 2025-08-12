import { AIInsights } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsights;
}

export function AIInsightsComponent({ insights }: AIInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--color-data-orange)]" />
            AI-Powered Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{insights.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Key Findings & Strategic Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--color-data-orange)]" />
              Key Findings
            </CardTitle>
            <CardDescription>
              Critical insights from competitive analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.keyFindings.map((finding, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{finding}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-data-orange)]" />
              Strategic Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated strategies for competitive advantage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.strategicRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 text-[var(--color-data-orange)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Opportunities & Competitive Advantages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Market Opportunities
            </CardTitle>
            <CardDescription>
              Identified growth opportunities in your market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.marketOpportunities.map((opportunity, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2">
                  {opportunity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Your Competitive Advantages
            </CardTitle>
            <CardDescription>
              Strengths that set you apart from competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.competitiveAdvantages.map((advantage, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2 border-green-200">
                  {advantage}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items & Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[var(--color-data-orange)]" />
              Immediate Action Items
            </CardTitle>
            <CardDescription>
              Priority tasks to implement this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.actionItems.map((action, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-data-orange)] text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Risk Factors
            </CardTitle>
            <CardDescription>
              Potential challenges to monitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}