/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
  icon?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface PortfolioItem {
  id: string;
  image: string;
  alt: string;
  category: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export interface Testimony {
  id: string;
  name: string;
  event: string;
  text: string;
  avatar: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}
