// src/ui/Icon.js — EduDer
// Los wireframes usan Tabler Icons; aquí se mapean a MaterialCommunityIcons (incluido en Expo).
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MAP = {
  flame: 'fire', bell: 'bell-outline', lock: 'lock-outline', check: 'check', x: 'close',
  'arrow-left': 'arrow-left', 'chevron-right': 'chevron-right', 'chevron-down': 'chevron-down',
  bolt: 'lightning-bolt', 'list-check': 'format-list-checks', award: 'medal-outline', star: 'star-outline',
  'player-play': 'play', book: 'book-open-page-variant-outline', puzzle: 'puzzle-outline',
  'device-gamepad-2': 'gamepad-variant-outline', briefcase: 'briefcase-outline',
  eye: 'eye-outline', 'eye-off': 'eye-off-outline', 'alert-triangle': 'alert-outline',
  'info-circle': 'information-outline', bulb: 'lightbulb-on-outline', 'grip-vertical': 'drag-vertical',
  'arrow-back-up': 'undo-variant', history: 'history', logout: 'logout', moon: 'weather-night',
  sun: 'white-balance-sunny', 'shield-star': 'shield-star-outline', target: 'target', trophy: 'trophy-outline',
  crown: 'crown-outline', clock: 'clock-outline', flag: 'flag-checkered', hourglass: 'timer-sand',
  mail: 'email-outline', 'mail-check': 'email-check-outline', school: 'school-outline', home: 'home-outline',
  user: 'account-outline', 'layout-dashboard': 'view-dashboard-outline', refresh: 'refresh',
  wifi: 'wifi-off', 'check-circle': 'check-circle-outline',
};

export default function Icon({ name, size = 22, color, style }) {
  return <MaterialCommunityIcons name={MAP[name] || name} size={size} color={color} style={style} />;
}
