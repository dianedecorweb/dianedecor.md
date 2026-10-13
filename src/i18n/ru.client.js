import { siteConfig } from '@/lib/site-config'

/**
 * Русские тексты интерактивных компонентов. Та же форма, что у ro.client.js.
 */

/** Три формы множественного числа: 1 предмет, 2 предмета, 5 предметов. */
export function plural(count, one, few, many) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

const ruClient = {
  lang: 'ru',

  dateLocale: 'ru-RU',

  layout: {
    skipToContent: 'Перейти к содержанию',
    homeAria: `${siteConfig.name} — главная страница`,
    mainNav: 'Основная навигация',
    footerNav: 'Навигация в подвале сайта',
    menu: 'Меню',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    requestOffer: 'Запросить предложение',
    languageLabel: 'Язык сайта',
    breadcrumbs: 'Навигационная цепочка',
  },

  nav: [
    { label: 'Главная', href: '/' },
    { label: 'Услуги', href: '/servicii' },
    { label: 'Портфолио', href: '/portofoliu' },
    { label: 'О нас', href: '/despre' },
    { label: 'Контакты', href: '/contact' },
  ],

  common: {
    seeDetails: 'Подробнее',
    priceOnRequest: 'Цена по запросу',
    all: 'Все',
    home: 'Главная',
    backHome: 'Вернуться на главную',
    writeUs: 'Напишите нам',
    servicePhotoAlt: (title) => `Пример работы DianeDecor: ${title.toLowerCase()}`,
    projectPhotoAlt: (title, location) => `Декор: ${title}${location ? `, ${location}` : ''}`,
  },

  testimonials: {
    more: 'Показать ещё',
    counter: (shown, total) => `${shown} из ${total} ${plural(total, 'отзыва', 'отзывов', 'отзывов')}`,
  },

  lightbox: {
    open: (index, total) => `Открыть фото ${index} из ${total}`,
    gallery: (title) => `Галерея — ${title}`,
    close: 'Закрыть галерею',
    previous: 'Предыдущее фото',
    next: 'Следующее фото',
    image: (title, index) => `${title} — фото ${index}`,
  },

  beforeAfter: {
    before: 'До',
    after: 'После',
    slider: 'Сравнить зал до и после декора',
    value: (position) => `${position}% — до`,
    beforeAlt: (title) => `${title}, до декора`,
    afterAlt: (title) => `${title}, после декора`,
    caption: 'Потяните линию, чтобы увидеть зал до и после декора.',
  },

  form: {
    name: 'Имя и фамилия',
    phone: 'Телефон',
    email: 'Email (необязательно)',
    eventType: 'Тип мероприятия',
    choose: 'Выберите...',
    eventTypeOther: 'Опишите мероприятие',
    eventTypeOtherPlaceholder: 'Например: корпоратив, выпускной...',
    eventDate: 'Дата мероприятия',
    dateFree: 'Эта дата у нас свободна.',
    dateBooked:
      'На этот день у нас уже есть мероприятие. Всё равно напишите: иногда мы можем взять декор поменьше или подскажем ближайшую свободную дату.',
    location: 'Место проведения',
    guestCount: 'Примерное число гостей',
    message: 'Сообщение',
    messagePlaceholder:
      'Коротко расскажите, что хотите: зал, цветовая палитра, какие зоны оформить.',
    honeypot: 'Не заполняйте это поле',
    sending: 'Отправляем...',
    submit: 'Отправить заявку',
    consent:
      'Отправляя форму, вы соглашаетесь, чтобы мы связались с вами по телефону или email. Смотрите',
    consentLink: 'как мы работаем',
    successTitle: 'Заявка отправлена',
    another: 'Отправить ещё одну заявку',
    rentalIntro: 'Хочу арендовать:',
    // Значения остаются румынскими (так их хранит база и видит студия),
    // посетителю показываются эти подписи.
    eventTypes: {
      'Decor nuntă': 'Декор свадьбы',
      'Decor cumetrie': 'Декор крестин',
      'Cerere în căsătorie': 'Предложение руки и сердца',
      'Decor aniversare': 'Декор дня рождения',
      'Cununie în aer liber': 'Выездная церемония',
      'Baloane cu heliu': 'Гелиевые шары',
      'Chirie decor': 'Аренда декора',
      Altceva: 'Другое',
    },
    // ponytail: ключи — румынские тексты из lib/validation.js. Если там поменяют
    // формулировку, сообщение просто останется румынским; QA-проверка это ловит.
    validation: {
      'Scrie numele tău.': 'Укажите ваше имя.',
      'Numele trebuie să aibă cel puțin 2 caractere.': 'Имя должно содержать не менее 2 символов.',
      'Numele poate avea maximum 80 de caractere.': 'Имя может содержать не более 80 символов.',
      'Scrie un număr de telefon.': 'Укажите номер телефона.',
      'Introdu un număr valid, de exemplu 069 216 064, sau unul din străinătate cu prefixul țării, ca +39 333 123 4567.':
        'Введите корректный номер, например 069 216 064, или зарубежный с кодом страны, например +39 333 123 4567.',
      'Introdu o adresă de email validă.': 'Введите корректный email.',
      'Alege tipul evenimentului.': 'Выберите тип мероприятия.',
      'Descrierea poate avea maximum 60 de caractere.': 'Описание может содержать не более 60 символов.',
      'Introdu o dată validă.': 'Введите корректную дату.',
      'Data nu poate fi în trecut.': 'Дата не может быть в прошлом.',
      'Data nu poate fi mai departe de 3 ani.': 'Дата не может быть позже, чем через 3 года.',
      'Locația poate avea maximum 120 de caractere.': 'Место может содержать не более 120 символов.',
      'Introdu un număr.': 'Введите число.',
      'Introdu un număr întreg.': 'Введите целое число.',
      'Numărul de invitați trebuie să fie cel puțin 1.': 'Гостей должно быть не меньше 1.',
      'Numărul de invitați poate fi cel mult 2000.': 'Гостей может быть не больше 2000.',
      'Scrie câteva detalii despre eveniment.': 'Напишите несколько слов о мероприятии.',
      'Mesajul trebuie să aibă cel puțin 10 caractere.': 'Сообщение должно содержать не менее 10 символов.',
      'Mesajul poate avea maximum 1000 de caractere.': 'Сообщение может содержать не более 1000 символов.',
      'Descrie ce eveniment vrei să decorezi.': 'Опишите, какое мероприятие нужно оформить.',
    },
    messages: {
      success: 'Спасибо! Мы получили вашу заявку и свяжемся с вами в течение 24 часов.',
      error: 'Что-то пошло не так. Попробуйте ещё раз или позвоните нам.',
      rateLimited: 'Вы отправили слишком много заявок. Попробуйте снова через несколько минут.',
    },
  },

  channels: {
    title: 'Наши контакты',
    call: 'Позвоните нам',
    callWithNumber: (phone) => `Позвонить: ${phone}`,
    instagram: 'Написать в Instagram',
    offer: 'Запросить предложение',
    offerDetail: 'Форма, отвечаем в тот же день',
    close: 'Закрыть',
  },

  popup: {
    title: 'Декор мероприятий в Молдове',
    text: 'Свадьбы, крестины, предложения руки и сердца и дни рождения — в Кишинёве и по всей стране. Назовите дату, и мы подготовим предложение.',
  },

  rental: {
    metaTitle: 'Аренда декора',
    metaDescription:
      'Арки, стойки, вазы и другие элементы декора в аренду для свадеб, крестин и мероприятий в Кишинёве и по всей Молдове. Выберите нужное и запросите предложение.',
    eyebrow: 'Аренда декора',
    title: 'Декор в аренду для вашего мероприятия',
    text: 'Выберите, что вам нужно, и список придёт к нам вместе с заявкой. Мы привезём, смонтируем и заберём всё после мероприятия.',
    emptyTitle: 'Каталог пополняется.',
    emptyText: 'А пока напишите, что хотите арендовать, и мы скажем, что есть в наличии.',
    notFound: 'Не нашли нужное?',
    notFoundAfter: 'и мы расскажем, что ещё у нас есть.',
    add: 'Добавить в заявку',
    added: 'Добавлено в заявку',
    units: { zi: '/ день', eveniment: '/ мероприятие', bucata: '/ шт.' },
    selectedRegion: 'Выбранные предметы',
    selected: (count) =>
      `${count} ${plural(count, 'предмет выбран', 'предмета выбрано', 'предметов выбрано')}`,
    limit: (max) => `Не больше ${max} в одной заявке. Если нужно больше, напишите нам напрямую.`,
    clear: 'Очистить',
    request: 'Запросить предложение',
  },

  errors: {
    title: 'Что-то пошло не так',
    text: 'Не удалось загрузить содержимое. Попробуйте ещё раз или позвоните нам.',
    retry: 'Попробовать снова',
    portfolioTitle: 'Не удалось загрузить портфолио',
    portfolioText: 'Возникла проблема при загрузке проектов. Попробуйте ещё раз или позвоните нам.',
  },

  notFound: {
    eyebrow: 'Ошибка 404',
    title: 'Страница не найдена',
    text: 'Адрес, который вы открыли, не существует или был перемещён. Посмотрите другие разделы сайта.',
    home: 'Главная страница',
    portfolio: 'Смотреть портфолио',
  },
}

export default ruClient
