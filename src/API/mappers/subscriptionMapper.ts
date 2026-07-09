import {
  FREE_FEATURES,
  PLAN_OPTIONS,
  VIP_FEATURES,
  VVIP_FEATURES,
  type PlanOption,
} from '../../Constant/Subscription';

export type SubscriptionPlanData = PlanOption & {
  title: string;
  features: string[];
};

export type SubscriptionPlansData = {
  freeFeatures: string[];
  vipPlan: SubscriptionPlanData;
  vvipPlan: SubscriptionPlanData;
};

export type SubscriptionApiPlan = {
  id?: number | string;
  name?: string | null;
  plan?: string | null;
  title?: string | null;
  slug?: string | null;
  price?: number | string | null;
  amount?: number | string | null;
  currency?: string | null;
  duration?: string | null;
  period?: string | null;
  features?: string[] | null;
  benefits?: string[] | null;
};

export type SubscriptionsResponse = {
  success?: boolean;
  plans?: SubscriptionApiPlan[];
  subscriptions?: SubscriptionApiPlan[];
  data?: SubscriptionApiPlan[] | { plans?: SubscriptionApiPlan[] };
  free_plan?: { features?: string[]; benefits?: string[] };
  free?: { features?: string[]; benefits?: string[] };
  message?: string;
};

const pickString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const pickNumber = (value?: number | string | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizePlanTier = (value?: string | null): 'VIP' | 'VVIP' | 'Free' | null => {
  const upper = value?.toUpperCase() ?? '';

  if (upper.includes('VVIP')) {
    return 'VVIP';
  }

  if (upper.includes('VIP')) {
    return 'VIP';
  }

  if (upper.includes('FREE')) {
    return 'Free';
  }

  return null;
};

const formatPriceLabel = (
  price: number,
  currency = 'PKR',
  fallback = 'PKR 0',
) => {
  if (!price) {
    return fallback;
  }

  return `${currency} ${price.toLocaleString('en-PK')}`;
};

const mapPlanFeatures = (plan?: SubscriptionApiPlan | null) => {
  const features = plan?.features ?? plan?.benefits ?? [];

  if (features.length > 0) {
    return features.filter(Boolean).map(String);
  }

  return null;
};

const buildPlanData = (
  tier: 'VIP' | 'VVIP',
  apiPlan: SubscriptionApiPlan | undefined,
  fallback: PlanOption,
  fallbackFeatures: string[],
  fallbackTitle: string,
): SubscriptionPlanData => {
  const price = pickNumber(apiPlan?.price ?? apiPlan?.amount) || fallback.price;
  const currency = pickString(apiPlan?.currency) || 'PKR';
  const features = mapPlanFeatures(apiPlan) ?? fallbackFeatures;
  const period = pickString(apiPlan?.duration, apiPlan?.period) || fallback.period;

  return {
    ...fallback,
    id: tier,
    title: pickString(apiPlan?.title, apiPlan?.name, apiPlan?.plan) || fallbackTitle,
    price,
    priceLabel: formatPriceLabel(price, currency, fallback.priceLabel),
    period,
    features,
  };
};

const extractPlans = (response?: SubscriptionsResponse | null) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.plans)) {
    return response.plans;
  }

  if (Array.isArray(response.subscriptions)) {
    return response.subscriptions;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === 'object' && Array.isArray(response.data.plans)) {
    return response.data.plans;
  }

  return [];
};

export const mapSubscriptions = (
  response?: SubscriptionsResponse | null,
): SubscriptionPlansData => {
  const plans = extractPlans(response);
  const freePlanApi = plans.find(
    plan => normalizePlanTier(plan.name ?? plan.plan ?? plan.title ?? plan.slug) === 'Free',
  );
  const vipPlanApi = plans.find(
    plan => normalizePlanTier(plan.name ?? plan.plan ?? plan.title ?? plan.slug) === 'VIP',
  );
  const vvipPlanApi = plans.find(
    plan => normalizePlanTier(plan.name ?? plan.plan ?? plan.title ?? plan.slug) === 'VVIP',
  );

  const freeFeatures =
    response?.free_plan?.features ??
    response?.free_plan?.benefits ??
    response?.free?.features ??
    response?.free?.benefits ??
    mapPlanFeatures(freePlanApi) ??
    FREE_FEATURES;

  return {
    freeFeatures,
    vipPlan: buildPlanData(
      'VIP',
      vipPlanApi,
      PLAN_OPTIONS.VIP,
      VIP_FEATURES,
      'VIP Plan',
    ),
    vvipPlan: buildPlanData(
      'VVIP',
      vvipPlanApi,
      PLAN_OPTIONS.VVIP,
      VVIP_FEATURES,
      'VVIP Plan',
    ),
  };
};
