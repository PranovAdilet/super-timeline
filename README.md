# Super Timeline

`super-timeline` — React/TypeScript библиотека и демо-приложение для монтажа таймлайна (video/image/text/audio) с последующим рендером через Remotion.

## Возможности

- редактирование клипов на таймлайне (позиция, длительность, треки);
- поддержка типов элементов: `video`, `image`, `text`, `audio`, `voiceover`;
- UI-компоненты редактора (таймлайн, линейка, плейхед, navbar, header и др.);
- рендер композиции `Timeline` в видео через Remotion (`render.mjs`);
- сборка как библиотеки с экспортами из `dist`.

## Технологии

- `React 19` + `TypeScript`;
- `Vite`;
- `Remotion` (`@remotion/cli`, `@remotion/player`, `@remotion/renderer`);
- `Radix UI`, `Tailwind`, `Zustand`, `RxJS`, `Fabric.js`.

## Быстрый старт

### 1) Установка

```bash
npm install
```

### 2) Локальный запуск

```bash
npm run dev
```

Приложение поднимается на `http://localhost:3000`.

### 3) Сборка библиотеки

```bash
npm run build
```

Команда собирает bundle и генерирует декларации типов в `dist`.

## Скрипты

- `npm run dev` — dev-сервер Vite на порту `3000`;
- `npm run build` — production build + `d.ts`;
- `npm run lint` — проверка ESLint;
- `npm run preview` — локальный preview собранного проекта.

## Рендер видео через Remotion

В проекте есть скрипт `render.mjs`, который:

1. принимает JSON с props;
2. собирает Remotion bundle;
3. выбирает композицию `Timeline`;
4. рендерит `mp4` (codec `h264`).

### Запуск

```bash
node render.mjs --props ./props.json
```

### Минимальный формат `props.json`

```json
{
  "fileName": "Timeline",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "trackItemIds": [],
  "trackItemsMap": {},
  "trackItemDetailsMap": {},
  "transitionsMap": {}
}
```

> Важно: сейчас `outputLocation` в `render.mjs` указывает на `/tmp/...mp4`. Для Windows обычно удобнее заменить путь на локальный (например, `./output/...mp4`).

## Публичные экспорты

Главная точка входа: `src/index.ts`.

Экспортируются:

- модули `components`, `classes`, `shared`, `lib/utils`;
- CSS: `style.css`;
- именованные компоненты: `TimelineComponent`, `NavbarComponent`, `PlayheadComponent`, `RulerComponent`, `Header`, `MenuList`, `ControlList`, `AppComponent`.

## Структура проекта

```text
src/
  components/      UI редактора и player-композиции
  classes/         бизнес-логика, события, менеджеры состояния
  shared/          типы, сторы и общие утилиты
  remotion/        регистрация RootComposition
render.mjs         CLI-рендер видео через Remotion
vite.config.ts     конфиг Vite + alias "@"
```

## Примечания по разработке

- alias `@` настроен на `src` в `vite.config.ts`;
- composition id для рендера: `Timeline`;
- длительность композиции вычисляется из `trackItemsMap` (по максимальному `display.to`).
