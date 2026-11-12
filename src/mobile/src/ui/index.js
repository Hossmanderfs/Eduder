// src/ui/index.js — EduDer
// Componentes base del sistema visual (equivalen a las clases de css/eduder.css del
// frontend de referencia): appbar, carné, botones, tarjetas, chips, barras, campos…
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, StyleSheet,
  StatusBar, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT, RADIUS } from '../theme';
import Icon from './Icon';

export { Icon };

// ── Texto ────────────────────────────────────────────────────────────────────
export function Txt({ style, w = 'regular', size = 15, color, children, ...rest }) {
  const { c } = useTheme();
  return (
    <Text
      allowFontScaling
      style={[{ fontFamily: FONT[w] || FONT.regular, fontSize: size, color: color || c.text, lineHeight: Math.round(size * 1.45) }, style]}
      {...rest}
    >{children}</Text>
  );
}

// ── Pantalla ─────────────────────────────────────────────────────────────────
export function Screen({ children, scroll = true, bar, header, footer, edges, onRefresh, refreshing, contentStyle }) {
  const { c } = useTheme();
  const top = header ? ['left', 'right'] : ['top', 'left', 'right'];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: header ? c.carne : c.surface }} edges={edges || top}>
      <StatusBar barStyle={header || c.dark ? 'light-content' : 'dark-content'} backgroundColor={header ? c.carne : c.surface} />
      {header}
      {bar}
      {scroll ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: c.surface }}
          contentContainerStyle={[{ padding: 16, paddingBottom: 28, gap: 20 }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.blue} colors={[c.blue]} /> : undefined}
        >{children}</ScrollView>
      ) : (
        <View style={[{ flex: 1, backgroundColor: c.surface, padding: 16, gap: 20 }, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export function BottomBar({ children }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ padding: 12, paddingBottom: 12 + Math.min(insets.bottom, 8), backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, gap: 8 }}>
      {children}
    </View>
  );
}

// ── Barras superiores ────────────────────────────────────────────────────────
export function IconBtn({ name, onPress, label, color, size = 24, badge }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(127,127,127,.16)' : 'transparent' })}
    >
      <Icon name={name} size={size} color={color || c.text} />
      {badge ? (
        <View style={{ position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: c.brandRed, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.carne }}>
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: FONT.semibold }}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function AppBar({ title, onBack, right, onBlue }) {
  const { c } = useTheme();
  const fg = onBlue ? c.onCarne : c.text;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingLeft: onBack ? 4 : 16, paddingRight: 8, gap: 4, backgroundColor: onBlue ? c.carne : c.surface, borderBottomWidth: onBlue ? 0 : 1, borderBottomColor: c.line }}>
      {onBack ? <IconBtn name="arrow-left" onPress={onBack} label="Volver" color={fg} /> : null}
      <Txt w="semibold" size={17} color={fg} style={{ flex: 1 }} numberOfLines={1} accessibilityRole="header">{title}</Txt>
      {right}
    </View>
  );
}

// Encabezado tipo carné institucional (WF-01, WF-03)
export function Carne({ top, children }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.carne, paddingHorizontal: 16, paddingBottom: 18 }}>
      {top}
      {children}
    </View>
  );
}

export function CarneTop({ titulo, children }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 6 }}>
      <Txt w="medium" size={13} color={c.onCarne2} style={{ flex: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>{titulo}</Txt>
      {children}
    </View>
  );
}

// ── Botones ──────────────────────────────────────────────────────────────────
export function Btn({ title, onPress, kind = 'primary', size = 'md', icon, loading, disabled, style, block = true }) {
  const { c } = useTheme();
  const off = disabled || loading;
  const K = {
    primary: { bg: c.blue, fg: c.onBlue, bd: 'transparent' },
    secondary: { bg: c.surface, fg: c.blueText, bd: c.lineStrong },
    ghost: { bg: 'transparent', fg: c.blueText, bd: 'transparent' },
    danger: { bg: c.err, fg: '#fff', bd: 'transparent' },
    ok: { bg: c.ok, fg: '#fff', bd: 'transparent' },
    gold: { bg: c.gold, fg: c.onGold, bd: 'transparent' },
  }[kind];
  const h = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
  const bg = off ? c.surface3 : K.bg;
  const fg = off ? c.text3 : K.fg;
  return (
    <Pressable
      onPress={off ? undefined : onPress} accessibilityRole="button" accessibilityState={{ disabled: !!off, busy: !!loading }}
      accessibilityLabel={title}
      style={({ pressed }) => [{
        minHeight: h, paddingHorizontal: size === 'sm' ? 12 : 20, borderRadius: size === 'lg' ? RADIUS.l : size === 'sm' ? RADIUS.s : RADIUS.m,
        backgroundColor: bg, borderWidth: 1.5, borderColor: off ? 'transparent' : K.bd,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        alignSelf: block ? 'stretch' : 'flex-start', opacity: pressed && !off ? 0.88 : 1,
      }, style]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} color={fg} /> : null}
      <Txt w="semibold" size={size === 'lg' ? 16 : size === 'sm' ? 13 : 15} color={fg}>{title}</Txt>
    </Pressable>
  );
}

export function LinkBtn({ title, onPress, style }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={[{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, style]}>
      <Txt w="medium" color={c.blueText} style={{ textDecorationLine: 'underline' }}>{title}</Txt>
    </Pressable>
  );
}

// ── Superficies ──────────────────────────────────────────────────────────────
export function Card({ children, style, soft = true }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: soft ? c.surface2 : c.surface, borderRadius: RADIUS.l, padding: 14, borderWidth: soft ? 0 : 1, borderColor: c.line, gap: 8 }, style]}>
      {children}
    </View>
  );
}

export function Chip({ text, tone = 'neutral', icon, style }) {
  const { c } = useTheme();
  const T = {
    neutral: [c.surface3, c.text2], blue: [c.blueSoft, c.blueText], ok: [c.okSoft, c.okText],
    err: [c.errSoft, c.errText], gold: [c.goldSoft, c.goldText], red: [c.redSoft, c.redText],
  }[tone];
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: T[0] }, style]}>
      {icon ? <Icon name={icon} size={14} color={T[1]} /> : null}
      <Txt w="medium" size={12} color={T[1]}>{text}</Txt>
    </View>
  );
}

export function Bar({ pct = 0, tone = 'blue', height = 6, style }) {
  const { c } = useTheme();
  const fill = { blue: c.blue, ok: c.ok, gold: c.gold }[tone];
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[{ height, borderRadius: height, backgroundColor: c.surface3, overflow: 'hidden' }, style]}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', borderRadius: height, backgroundColor: fill }} />
    </View>
  );
}

export function Stat({ icon, tone = 'blue', value, label }) {
  const { c } = useTheme();
  const col = tone === 'gold' ? c.gold : c.blueText;
  return (
    <View style={{ flex: 1, backgroundColor: c.surface2, borderRadius: RADIUS.m, padding: 12, alignItems: 'center', gap: 2 }}>
      {icon ? <Icon name={icon} size={18} color={col} /> : null}
      <Txt w="semibold" size={20}>{value}</Txt>
      <Txt size={12} color={c.text3} style={{ textAlign: 'center' }}>{label}</Txt>
    </View>
  );
}

export function Banner({ tone = 'info', children, icon }) {
  const { c } = useTheme();
  const T = { info: [c.blueSoft, c.blueText, 'info-circle'], warn: [c.goldSoft, c.goldText, 'info-circle'], error: [c.errSoft, c.errText, 'alert-triangle'], ok: [c.okSoft, c.okText, 'check-circle'] }[tone];
  return (
    <View accessibilityRole={tone === 'error' ? 'alert' : undefined} style={{ flexDirection: 'row', gap: 10, backgroundColor: T[0], padding: 12, borderRadius: RADIUS.m, alignItems: 'flex-start' }}>
      <Icon name={icon || T[2]} size={18} color={T[1]} style={{ marginTop: 2 }} />
      <Txt size={13} color={T[1]} style={{ flex: 1 }}>{children}</Txt>
    </View>
  );
}

export function SectionHead({ title, action, onAction }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Txt w="semibold" size={19} accessibilityRole="header">{title}</Txt>
      {action ? <Pressable onPress={onAction} style={{ minHeight: 44, justifyContent: 'center' }}><Txt w="medium" size={13} color={c.blueText}>{action}</Txt></Pressable> : null}
    </View>
  );
}

// Fila de lista (lecciones, ajustes, medallas…)
export function ListRow({ icon, iconTone = 'blue', title, sub, right, onPress, locked, children, style }) {
  const { c } = useTheme();
  const tone = { blue: [c.blueSoft, c.blueText], ok: [c.okSoft, c.okText], gold: [c.goldSoft, c.goldText], red: [c.redSoft, c.redText], neutral: [c.surface3, c.text3] }[iconTone];
  const Wrap = onPress && !locked ? Pressable : View;
  return (
    <Wrap
      onPress={onPress} accessibilityRole={onPress && !locked ? 'button' : undefined} accessibilityLabel={locked ? `${title}, bloqueada` : undefined}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, padding: 12, borderRadius: RADIUS.m, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, opacity: locked ? 0.62 : 1 }, style]}
    >
      {icon ? (
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: tone[0], alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={tone[1]} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium">{title}</Txt>
        {sub ? <Txt size={12} color={c.text3}>{sub}</Txt> : null}
        {children}
      </View>
      {right}
    </Wrap>
  );
}

export function Avatar({ nombre = '', apellido = '', size = 44, neutral, style }) {
  const { c } = useTheme();
  const ini = ((nombre[0] || '') + (apellido[0] || '')).toUpperCase() || '·';
  return (
    <View accessibilityElementsHidden style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: neutral ? c.surface3 : 'rgba(255,255,255,0.18)' }, style]}>
      <Txt w="semibold" size={Math.round(size * 0.38)} color={neutral ? c.text2 : '#fff'}>{ini}</Txt>
    </View>
  );
}

export function Logo({ size = 52 }) {
  const { c } = useTheme();
  return (
    <View accessibilityElementsHidden style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: c.brandBlue, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: c.brandRed }}>
      <Text style={{ color: '#fff', fontFamily: FONT.bold, fontSize: size * 0.56 }}>E</Text>
    </View>
  );
}

// ── Estados ──────────────────────────────────────────────────────────────────
export function Loading({ text = 'Cargando…' }) {
  const { c } = useTheme();
  return (
    <View accessibilityLiveRegion="polite" style={{ alignItems: 'center', gap: 12, paddingVertical: 48 }}>
      <ActivityIndicator size="large" color={c.blue} />
      <Txt color={c.text2}>{text}</Txt>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 12 }}>
      <Icon name="wifi" size={36} color={c.text3} />
      <Txt w="semibold" size={17}>No pudimos cargar esto</Txt>
      <Txt color={c.text2} style={{ textAlign: 'center' }}>{message || 'Revisa tu conexión e inténtalo de nuevo.'}</Txt>
      {onRetry ? <Btn title="Reintentar" icon="refresh" kind="secondary" onPress={onRetry} block={false} /> : null}
    </View>
  );
}

export function Empty({ icon = 'info-circle', title, text, children }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 36, paddingHorizontal: 12 }}>
      <Icon name={icon} size={40} color={c.text3} />
      <Txt w="semibold" size={19} style={{ textAlign: 'center' }}>{title}</Txt>
      {text ? <Txt color={c.text2} style={{ textAlign: 'center' }}>{text}</Txt> : null}
      {children}
    </View>
  );
}

// ── Formularios ──────────────────────────────────────────────────────────────
export function Field({ label, value, onChangeText, error, ok, help, secure, style, inputRef, ...rest }) {
  const { c } = useTheme();
  const [ver, setVer] = useState(false);
  const [foco, setFoco] = useState(false);
  const borde = error ? c.err : ok ? c.ok : foco ? c.blue : c.lineStrong;
  const msg = error || ok || help;
  const col = error ? c.errText : ok ? c.okText : c.text3;
  return (
    <View style={[{ gap: 6 }, style]}>
      <Txt w="medium" size={13}>{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, borderRadius: RADIUS.m, borderWidth: foco ? 2 : 1.5, borderColor: borde, backgroundColor: c.surface }}>
        <TextInput
          ref={inputRef}
          value={value} onChangeText={onChangeText} secureTextEntry={secure && !ver}
          onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
          placeholderTextColor={c.text3} accessibilityLabel={label}
          style={{ flex: 1, minHeight: 46, paddingHorizontal: 14, fontFamily: FONT.regular, fontSize: 15, color: c.text }}
          {...rest}
        />
        {secure ? <IconBtn name={ver ? 'eye-off' : 'eye'} label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setVer(v => !v)} color={c.text2} size={22} /> : null}
      </View>
      {msg ? <Txt size={12} color={col}>{msg}</Txt> : null}
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>{children}</View>;
}

export { StyleSheet, Platform };
