export function withCheapestPricing<
  T extends {
    pricing?: {
      input: number
      output: number
      perSecond?: number
      perImage?: number
    }
  },
>(models: T[]) {
  const modelsWithPricing = models.filter((model) => Boolean(model.pricing))

  if (!modelsWithPricing.length) {
    return models
  }

  const getScore = (model: T) => {
    const pricing = model.pricing
    if (!pricing) {
      return Number.POSITIVE_INFINITY
    }
    return (
      pricing.input +
      pricing.output +
      (pricing.perSecond ?? 0) +
      (pricing.perImage ?? 0)
    )
  }

  const orderedModels = [...models].sort((left, right) => {
    const leftScore = getScore(left)
    const rightScore = getScore(right)

    if (leftScore === rightScore) {
      return 0
    }

    return leftScore - rightScore
  })

  return orderedModels
}
