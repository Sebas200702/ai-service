import {
  imageModels,
  textModels,
  transcriptionModels,
  voiceModels,
} from '@/core/models'
import { withCheapestPricing } from '@/core/orchestration/low-cost'
import { withLowestLatency } from '@/core/orchestration/low-latency'
import type {
  AISelectionMode,
  AISelectionStrategy,
  AIModalities,
  AIModelDescriptor,
} from '@/types'

export type ModelSelectionInput = {
  mode: AISelectionMode
  strategy: AISelectionStrategy
  modelId?: string
}

type SelectorState<T> = {
  signature: string
  next: () => T
}

const selectorCache = new Map<string, SelectorState<unknown>>()

function createRoundRobin<T>(models: T[]) {
  let index = 0
  return () => {
    if (!models.length) {
      throw new Error('No models available')
    }
    const model = models[index]
    index = (index + 1) % models.length
    return model
  }
}

function signatureOf<T extends { id: string }>(models: T[]) {
  return models.map((model) => model.id).join('|')
}

function getCachedSelector<T>(cacheKey: string, models: T[]) {
  const signature = signatureOf(models as T[] & { id: string }[])
  const cached = selectorCache.get(cacheKey) as SelectorState<T> | undefined

  if (cached?.signature === signature) {
    return cached.next
  }

  const next = createRoundRobin(models)
  selectorCache.set(cacheKey, {
    signature,
    next,
  })
  return next
}

function selectManualModel<T extends { id: string }>(
  models: T[],
  modelId?: string
) {
  if (!modelId) {
    throw new Error('Manual mode requires a modelId')
  }

  const model = models.find((candidate) => candidate.id === modelId)
  if (!model) {
    throw new Error(`Model not found: ${modelId}`)
  }

  return [model]
}

async function resolveOrderedModels<T extends AIModelDescriptor<unknown>>(
  models: T[],
  type: AIModalities,
  selection: ModelSelectionInput
) {
  if (selection.mode === 'manual') {
    return selectManualModel(models, selection.modelId)
  }

  if (selection.strategy === 'lowCost') {
    return withCheapestPricing(models)
  }

  if (selection.strategy === 'lowLatency') {
    return await withLowestLatency(models, type)
  }

  return models
}

async function getNextModel<T extends AIModelDescriptor<unknown>>(
  models: T[],
  type: AIModalities,
  selection: ModelSelectionInput
) {
  const orderedModels = await resolveOrderedModels(models, type, selection)
  const cacheKey = `${type}:${selection.mode}:${selection.strategy}`
  const selector = getCachedSelector(cacheKey, orderedModels)

  return selector()
}

async function getModelCandidates<T extends AIModelDescriptor<unknown>>(
  models: T[],
  type: AIModalities,
  selection: ModelSelectionInput
) {
  return await resolveOrderedModels(models, type, selection)
}

export const getNextTextModel = (selection: ModelSelectionInput) =>
  getNextModel(textModels, 'text', selection)
export const getNextImageModel = (selection: ModelSelectionInput) =>
  getNextModel(imageModels, 'image', selection)
export const getNextTranscriptionModel = (selection: ModelSelectionInput) =>
  getNextModel(transcriptionModels, 'transcription', selection)
export const getNextAudioModel = (selection: ModelSelectionInput) =>
  getNextModel(voiceModels, 'voice', selection)

export const getTextModelCandidates = (selection: ModelSelectionInput) =>
  getModelCandidates(textModels, 'text', selection)
export const getImageModelCandidates = (selection: ModelSelectionInput) =>
  getModelCandidates(imageModels, 'image', selection)
export const getTranscriptionModelCandidates = (
  selection: ModelSelectionInput
) => getModelCandidates(transcriptionModels, 'transcription', selection)
export const getAudioModelCandidates = (selection: ModelSelectionInput) =>
  getModelCandidates(voiceModels, 'voice', selection)
