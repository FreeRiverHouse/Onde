import en from '../../messages/en.json';
import it from '../../messages/it.json';
import { Locale } from './config';

const messages = {
  en,
  it,
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

export type Messages = typeof en;
