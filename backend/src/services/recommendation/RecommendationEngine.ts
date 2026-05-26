import type { RecommendationOptions, RecommendationResult, RecommendationStrategy } from '../../types/recommendation'
import logger from '../../utils/logger'
import { CollaborativeFilteringStrategy } from './strategies/CollaborativeFiltering'
import { ContentBasedStrategy } from './strategies/ContentBased'
import { TrendingStrategy } from './strategies/Trending'

export class RecommendationEngine {
  private strategies: Map<string, RecommendationStrategy> = new Map()
  private defaultStrategy: string = 'hybrid'

  constructor() {
    this.registerStrategies()
  }

  private registerStrategies(): void {
    const strategies: RecommendationStrategy[] = [
      new CollaborativeFilteringStrategy(),
      new ContentBasedStrategy(),
      new TrendingStrategy(),
    ]

    strategies.forEach((strategy) => {
      this.strategies.set(strategy.name, strategy)
    })
  }

  async getRecommendations(
    userId: string,
    options: RecommendationOptions & { strategy?: string } = {}
  ): Promise<RecommendationResult[]> {
    const { strategy, ...recOptions } = options

    if (strategy && this.strategies.has(strategy)) {
      const result = await this.executeStrategy(strategy, userId, recOptions)
      return [result]
    }

    // 默认混合策略：并行执行所有策略并合并结果
    return await this.hybridRecommend(userId, recOptions)
  }

  private async executeStrategy(
    strategyName: string,
    userId: string,
    options: RecommendationOptions
  ): Promise<RecommendationResult> {
    const strategy = this.strategies.get(strategyName)

    if (!strategy) {
      throw new Error(`Unknown recommendation strategy: ${strategyName}`)
    }

    try {
      return await strategy.getRecommendations(userId, options)
    } catch (error) {
      logger.error(`Error in ${strategyName} strategy`, { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private async hybridRecommend(
    userId: string,
    options: RecommendationOptions
  ): Promise<RecommendationResult[]> {
    const strategyNames = Array.from(this.strategies.keys())

    // 并行执行所有策略
    const results = await Promise.allSettled(
      strategyNames.map((name) => this.executeStrategy(name, userId, options))
    )

    // 过滤成功的结果
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<RecommendationResult> =>
        result.status === 'fulfilled'
      )
      .map((result) => result.value)

    if (successfulResults.length === 0) {
      throw new Error('All recommendation strategies failed')
    }

    // 按置信度排序
    successfulResults.sort((a, b) => b.confidence - a.confidence)

    return successfulResults
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys())
  }
}

export const recommendationEngine = new RecommendationEngine()
export default RecommendationEngine
