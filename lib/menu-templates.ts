import { MenuCategory } from './types'

export interface MenuTemplate {
  id: string
  name: string
  tagline: string
  venueType: string
  icon: string
  description: string
  color: string
  coverImage: string
  categories: MenuCategory[]
}

export const PRESET_MENU_TEMPLATES: MenuTemplate[] = [
  // 1. ALL-DAY DINING KAFE & MODERN BISTRO
  {
    id: 'all-day-dining-bistro',
    name: 'All-Day Dining Kafe & Modern Bistro',
    tagline: 'Artizan kahvaltı tabakları, el yapımı gurme burgerler, taze makarnalar ve imza kahveler',
    venueType: 'Kafe & Bistro',
    icon: '☕',
    color: '#d97706',
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop',
    description: 'Günün her saatine eşlik eden zengin kahvaltı seçkileri, usta şeflerimizin elinden çıkan özel soslu ana yemekler, taze fırın pastaları ve nitelikli espresso lezzetleri.',
    categories: [
      {
        id: 'cat-kfe-kahvalti',
        name: 'Kahvaltı, Sahanda Lezzetler & Omletler',
        description: 'Serpme kahvaltı tabakları, bakır sahanda köy yumurtaları ve taze sıcak omlet çeşitleri',
        is_active: true,
        display_order: 1,
        items: [
          {
            id: 'kfe-khv-1',
            name: 'Gurme Serpme Kahvaltı Tabağı',
            description: 'Ezine beyaz peynir, taze kaşar, siyah ve yeşil zeytin seçkisi, çeri domates, çıtır salatalık, serbest gezen tavuk yumurtası, petek bal-kaymak, organik reçel, dana salam, sıcak sigara böreği, baharatlı patates kızartması ve taze demleme çay.',
            price: '280 ₺',
            calories: 780,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-khv-2',
            name: 'Hızlı & Dengeli Kahvaltı Tabağı',
            description: 'Olgunlaştırılmış Ezine peyniri, eski kaşar, Gemlik zeytini, domates, salatalık, haşlanmış köy yumurtası, süzme bal, tereyağı ve simit eşliğinde.',
            price: '180 ₺',
            calories: 490,
            allergens: ['Süt Ürünleri', 'Yumurta', 'Gluten'],
            image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-khv-3',
            name: 'Bakır Sahanda Kaşarlı Menemen',
            description: 'Köy yumurtası, Çanakkale tarla domatesi, tatlı sivri biber ve bol erimiş taze kaşar peyniri.',
            price: '155 ₺',
            calories: 340,
            allergens: ['Yumurta', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 3,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-khv-4',
            name: 'Kasap Sucuklu Menemen',
            description: 'Özel baharatlı dana kasap sucuğu, sote domates, biber ve sahanda köy yumurtası.',
            price: '175 ₺',
            calories: 410,
            allergens: ['Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 4,
            is_available: true
          },
          {
            id: 'kfe-khv-5',
            name: 'Rize Kavurmalı Menemen',
            description: 'Taş fırında dinlendirilmiş dana kavurma, yayık tereyağı, domates ve yumurtanın geleneksel uyumu.',
            price: '210 ₺',
            calories: 460,
            allergens: ['Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 5,
            is_available: true
          },
          {
            id: 'kfe-khv-6',
            name: 'Taze Kaşarlı Sıcak Omlet',
            description: '3 adet çırpılmış köy yumurtası, bol taze kaşar dolgusu ve çıtır patates garnitürü.',
            price: '145 ₺',
            calories: 320,
            allergens: ['Yumurta', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 6,
            is_available: true
          },
          {
            id: 'kfe-khv-7',
            name: 'Kasap Sucuklu Omlet',
            description: 'Izgara dana sucuk parçacıkları, taze yeşillikler ve süzme yoğurt sos ile.',
            price: '165 ₺',
            calories: 390,
            allergens: ['Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 7,
            is_available: true
          },
          {
            id: 'kfe-khv-8',
            name: 'Dana Kavurmalı Spesiyal Omlet',
            description: 'Özel lezzetli Rize dana kavurması, tereyağı ve mevsim yeşillikleri.',
            price: '195 ₺',
            calories: 440,
            allergens: ['Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 8,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-khv-9',
            name: 'Mantar & Kaşarlı Karışık Omlet',
            description: 'Sote kültür mantarı, dana sucuk, sosis ve kaşar peyniri harmanı.',
            price: '180 ₺',
            calories: 410,
            allergens: ['Yumurta', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 9,
            is_available: true
          },
          {
            id: 'kfe-khv-10',
            name: 'Bakır Sahanda Kasap Sucuklu Yumurta',
            description: 'Hakiki fermente dana sucuk ve yayık tereyağında pişmiş çift göz köy yumurtası.',
            price: '160 ₺',
            calories: 420,
            allergens: ['Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
            display_order: 10,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-tost',
        name: 'Artizan Tostlar & Gurme Sandviçler',
        description: 'Taze ekşi maya ve bazlama ekmeklerinde sıcak tostlar, soğuk baget sandviçler',
        is_active: true,
        display_order: 2,
        items: [
          {
            id: 'kfe-tst-1',
            name: 'Eski Kaşarlı Klasik Tost',
            description: 'Tost ekmeğinde bol taze kaşar peyniri, domates dilimleri ve patates cipsi.',
            price: '110 ₺',
            calories: 340,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 1,
            is_available: true
          },
          {
            id: 'kfe-tst-2',
            name: 'Kasap Sucuklu & Kaşarlı Karışık Tost',
            description: 'Hakiki dana sucuk, bol kaşar peyniri, ev yapımı domates salçası sosu ve çıtır patates.',
            price: '140 ₺',
            calories: 420,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 2,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-tst-3',
            name: 'Rize Kavurmalı & Kaşarlı Bazlama Tost',
            description: 'Közde ısıtılmış sıcak bazlama ekmeğinde dana kavurma, erimiş kaşar ve kekikli tereyağı.',
            price: '190 ₺',
            calories: 520,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-tst-4',
            name: 'Bistro Spesiyal Füme Tost',
            description: 'Ekşi maya ekmeğinde dana füme kaburga, cheddar peyniri, karamelize soğan ve trüflü mayonez.',
            price: '210 ₺',
            calories: 580,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 4,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-tst-5',
            name: 'Ton Balıklı Akdeniz Baget Sandviç',
            description: 'Çıtır Fransız bagetinde lezzetli ton balığı, tatlı mısır, kornişon turşu, kıvırcık marul ve dereotlu mayonez.',
            price: '160 ₺',
            calories: 380,
            allergens: ['Gluten', 'Balık', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 5,
            is_available: true
          },
          {
            id: 'kfe-tst-6',
            name: 'Ezine Peynirli & Avokadolu Sandviç',
            description: 'Ezine beyaz peynir, taze avokado püresi, salkım domates, kekikli zeytinyağı ve taze baget.',
            price: '140 ₺',
            calories: 330,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
            display_order: 6,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-doyumluk',
        name: 'Şefin İmzası Burgerler & Wrapler',
        description: 'Dinlendirilmiş el yapımı dana burgerler, ızgara kasap köfte ve sıcak tortilla dürümler',
        is_active: true,
        display_order: 3,
        items: [
          {
            id: 'kfe-dym-1',
            name: 'Klasik Cheddar Cheeseburger & Patates',
            description: '150g dinlendirilmiş dana köfte, eritilmiş İngiliz cheddar peyniri, karamelize soğan, marul, ev yapımı burger sosu ve baharatlı patates.',
            price: '255 ₺',
            calories: 690,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-dym-2',
            name: 'Double Smash Gurme Burger',
            description: '2x100g smash dana köfte, duble cheddar peyniri, tütsülenmiş dana füme et, karamelize soğan ve trüf mayonez.',
            price: '310 ₺',
            calories: 840,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-dym-3',
            name: 'Trüflü & Mantarlı Bistro Burger',
            description: 'Dana köfte, sote istiridye ve kültür mantarı, trüflü aioli sos, füme peynir ve çıtır patates.',
            price: '280 ₺',
            calories: 760,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-dym-4',
            name: 'Porsiyon Izgara Kasap Köfte',
            description: '6 adet kömürde pişmiş ızgara köfte, baharatlı patates kızartması, köz domates-biber, tereyağlı pilav ve tırnak pide.',
            price: '270 ₺',
            calories: 640,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
            display_order: 4,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-dym-5',
            name: 'Çıtır Tavuk Wrap & Patates',
            description: 'Tortilla lavaşında sotelenmiş jülyen tavuk parçaları, renkli biberler, eritilmiş kaşar ve ballı hardal sos.',
            price: '210 ₺',
            calories: 520,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            display_order: 5,
            is_available: true
          },
          {
            id: 'kfe-dym-6',
            name: 'Izgara Köfte Wrap & Patates',
            description: 'Lavaş içerisine ızgara kasap köfteleri, salkım domates, sumaklı soğan, kaşar peyniri ve patates kızartması.',
            price: '235 ₺',
            calories: 580,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            display_order: 6,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-tavuk',
        name: 'Özel Soslu Şef Tavuk Tabakları',
        description: 'Tüm tabaklarımız tereyağlı makarna ve Akdeniz yeşillikleri salatası ile servis edilir',
        is_active: true,
        display_order: 4,
        items: [
          {
            id: 'kfe-tvk-1',
            name: 'Kremalı Köri Soslu Tavuk',
            description: 'Kremalı köri sosunda sotelenmiş taze tavuk göğsü dilimleri, kültür mantarı, penne makarna ve mevsim salatası.',
            price: '260 ₺',
            calories: 680,
            allergens: ['Süt Ürünleri', 'Gluten'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-tvk-2',
            name: 'Meksika Soslu Tavuk (Hafif Acılı)',
            description: 'Acılı salsa Meksika sosu, jalapeno biber, mısır, kırmızı fasulye, penne makarna ve salata.',
            price: '265 ₺',
            calories: 640,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-tvk-3',
            name: 'Tütsülenmiş Barbekü (BBQ) Soslu Tavuk',
            description: 'Barbekü soslu marine tavuk göğsü, karamelize soğan, penne makarna ve Akdeniz yeşillikleri.',
            price: '260 ₺',
            calories: 660,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-tvk-4',
            name: 'Dağ Kekikli Kremalı Tavuk',
            description: 'Taze dağ kekiği, hafif krema sos, mantar dilimleri, penne makarna ve zeytinyağlı salata.',
            price: '270 ₺',
            calories: 690,
            allergens: ['Süt Ürünleri', 'Gluten'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 4,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-tvk-5',
            name: 'Sweet Chili Tatlı Ekşi Soslu Tavuk',
            description: 'Uzak Doğu tatlı acı sosu ile karamelize edilmiş tavuk lokumları, kavrulmuş susam, makarna ve salata.',
            price: '265 ₺',
            calories: 630,
            allergens: ['Gluten', 'Susam'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 5,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-makarna',
        name: 'Taze Makarnalar & Kayseri Mantısı',
        description: 'Özel soslu İtalyan makarnaları ve tereyağlı geleneksel Kayseri mantısı',
        is_active: true,
        display_order: 5,
        items: [
          {
            id: 'kfe-mkr-1',
            name: 'Tavuklu & Mantarlı Fettuccine Alfredo',
            description: 'Jülyen tavuk dilimleri, taze kültür mantarı, ipeksi krema sos ve rendelenmiş parmesan peyniri.',
            price: '240 ₺',
            calories: 640,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-mkr-2',
            name: 'Penne all Arrabbiata (Acılı)',
            description: 'Acılı İtalyan domates sosu, dilim siyah zeytin, sarımsak, taze fesleğen yaprakları ve parmesan.',
            price: '190 ₺',
            calories: 480,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-mkr-3',
            name: 'Köri Soslu Tavuklu Penne',
            description: 'Kremalı köri sosu, sotelenmiş tavuk parçaları, mantar ve kaşar rendesi.',
            price: '230 ₺',
            calories: 590,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-mkr-4',
            name: 'Geleneksel El Açması Kayseri Mantısı',
            description: 'Sarımsaklı tava yoğurdu, kızgın tereyağlı pul biber sosu ve nane ile servis edilir.',
            price: '220 ₺',
            calories: 560,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 4,
            is_available: true,
            is_featured: true
          }
        ]
      },
      {
        id: 'cat-kfe-salata',
        name: 'Bahçe Yeşillikleri & Gurme Salatalar',
        description: 'Taze Akdeniz yeşillikleri ve özel soslarla hazırlanan hafif ve besleyici kase salatalar',
        is_active: true,
        display_order: 6,
        items: [
          {
            id: 'kfe-slt-1',
            name: 'Çıtır Tavuklu Sezar Salata',
            description: 'Taze marul yaprakları, çıtır pane tavuk lokumları, sarımsaklı kruton ekmek, parmesan ve orijinal Sezar sos.',
            price: '220 ₺',
            calories: 460,
            allergens: ['Gluten', 'Yumurta', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-slt-2',
            name: 'Izgara Tavuklu Akdeniz Salata',
            description: 'Akdeniz yeşillikleri, marine ızgara tavuk dilimleri, çeri domates, salatalık, mısır ve ballı hardal sos.',
            price: '230 ₺',
            calories: 420,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-slt-3',
            name: 'Ton Balıklı Ege Salatası',
            description: 'Roka, marul, tatlı mısır, zeytin dilimleri, salatalık ve sızma zeytinyağlı limon sosu.',
            price: '210 ₺',
            calories: 360,
            allergens: ['Balık'],
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            display_order: 3,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-atistirmalik',
        name: 'Çıtır Atıştırmalıklar & Paylaşımlıklar',
        description: 'Sıcak sepetler, özel baharatlı patates kızartmaları ve parmak lezzetler',
        is_active: true,
        display_order: 7,
        items: [
          {
            id: 'kfe-ats-1',
            name: 'Büyük Combo Atıştırmalık Sepeti',
            description: 'Baharatlı parmak patates, çıtır soğan halkaları, sosis, çıtır sigara böreği, tavuk nugget ve 2 özel dip sos.',
            price: '240 ₺',
            calories: 780,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-ats-2',
            name: 'Baharatlı Parmak Patates Kızartması',
            description: 'Cajun baharat karışımı, ev yapımı sarımsaklı mayonez ve ketçap ile.',
            price: '110 ₺',
            calories: 380,
            image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-ats-3',
            name: 'Kekikli Fırın Elma Dilim Patates',
            description: 'Dağ kekiği ve toz kırmızı biber aromalı çıtır fırın patates.',
            price: '120 ₺',
            calories: 360,
            image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400',
            display_order: 3,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-tatli',
        name: 'İmza Tatlılar & Fırın Pastaları',
        description: 'Taze fırınlanmış San Sebastian cheesecake, sıcak akışkan sufle ve geleneksel tatlılar',
        is_active: true,
        display_order: 8,
        items: [
          {
            id: 'kfe-ttl-1',
            name: 'Orijinal San Sebastian Cheesecake',
            description: 'Kremamsı akışkan iç doku, kızarmış üst kabuk ve yanında sıcak eritilmiş Belçika sütlü çikolatası ile.',
            price: '175 ₺',
            calories: 510,
            allergens: ['Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-ttl-2',
            name: 'Sıcak Akışkan Çikolatalı Sufle',
            description: '%70 bitter Belçika çikolatası, pudra şekeri ve vanilyalı Maraş dondurması eşliğinde.',
            price: '160 ₺',
            calories: 460,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
            display_order: 2,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-ttl-3',
            name: 'Karamelli Üç Sütlü Trileçe',
            description: 'Geleneksel Balkan keki, manda ve keçi sütü şerbeti, ipeksi karamel sosu.',
            price: '130 ₺',
            calories: 340,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-ttl-4',
            name: 'Sıcak Cevizli Çikolatalı Brownie',
            description: 'Yoğun çikolata dokusu, kavrulmuş ceviz parçaları ve kesme dondurma ile.',
            price: '150 ₺',
            calories: 440,
            allergens: ['Gluten', 'Süt Ürünleri', 'Ceviz'],
            image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
            display_order: 4,
            is_available: true
          },
          {
            id: 'kfe-ttl-5',
            name: 'Fırınlanmış Yanık Köy Sütlacı',
            description: 'Hakiki yağlı köy sütü, pirinç ve fırında karamelize edilmiş üst kabuk, bol fındık ile.',
            price: '110 ₺',
            calories: 290,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
            display_order: 5,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-sicak-icecek',
        name: 'Nitelikli Sıcak Kahveler & Demleme Çaylar',
        description: '%100 Arabica çekirdek harmanları, taze demlenmiş Rize çayı ve aromatik bitki çayları',
        is_active: true,
        display_order: 9,
        items: [
          {
            id: 'kfe-sc-1',
            name: 'Geleneksel Demleme Türk Çayı (İnce Belli)',
            description: 'Rize yaylalarının taze sürgün yapraklarından demlenmiş berrak tavşan kanı çay.',
            price: '25 ₺',
            calories: 2,
            image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
            display_order: 1,
            is_available: true
          },
          {
            id: 'kfe-sc-2',
            name: 'Közde Pişmiş Türk Kahvesi',
            description: 'Taze çekilmiş çekirdeklerden bol köpüklü, su ve Antep fıstıklı lokum ile servis edilir.',
            price: '65 ₺',
            calories: 25,
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-sc-3',
            name: 'Double Shot Türk Kahvesi',
            description: 'Büyük porsiyon kupa fincanda yoğun aromalı Türk kahvesi.',
            price: '90 ₺',
            calories: 40,
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-sc-4',
            name: 'Taze Çekilmiş Filtre Kahve',
            description: 'Orta kavrum Arabica harmanı, taze demlenmiş (Sade veya Sıcak Sütlü).',
            price: '85 ₺',
            calories: 10,
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 4,
            is_available: true
          },
          {
            id: 'kfe-sc-5',
            name: 'Caffè Latte',
            description: 'Tek shot espresso üzerine ipeksi mikro köpüklü taze sıcak süt.',
            price: '95 ₺',
            calories: 140,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 5,
            is_available: true
          },
          {
            id: 'kfe-sc-6',
            name: 'Karamel Macchiato',
            description: 'Vanilya aroması, sıcak süt köpüğü, double shot espresso ve karamel sos katmanları.',
            price: '110 ₺',
            calories: 210,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 6,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-sc-7',
            name: 'Atom Şifa Kış Çayı (French Press)',
            description: 'Taze zencefil, çubuk tarçın, karanfil, elma dilimleri, kuşburnu ve yayla balı ile.',
            price: '85 ₺',
            calories: 25,
            image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
            display_order: 7,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-sc-8',
            name: 'Ihlamur & Çiçek Balı (French Press)',
            description: 'Doğal kurutulmuş yaprak ıhlamur ve taze limon dilimi.',
            price: '75 ₺',
            calories: 10,
            image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
            display_order: 8,
            is_available: true
          },
          {
            id: 'kfe-sc-9',
            name: 'Sütlü Belçika Sıcak Çikolatası',
            description: 'Eritilmiş hakiki çikolata ve kremsi sıcak sütün yoğun kış lezzeti.',
            price: '95 ₺',
            calories: 260,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
            display_order: 9,
            is_available: true
          }
        ]
      },
      {
        id: 'cat-kfe-soguk-icecek',
        name: 'Artizan Soğuk Kahveler & Ferahlatıcı İçecekler',
        description: 'Buzlu espresso harmanları, ev yapımı taze naneli limonata ve soğuk meşrubatlar',
        is_active: true,
        display_order: 10,
        items: [
          {
            id: 'kfe-sg-1',
            name: 'Ev Yapımı Naneli Taze Limonata',
            description: 'Taze sıkılmış limon suyu, ezilmiş nane yaprakları ve buz ile ferahlatıcı lezzet.',
            price: '85 ₺',
            calories: 110,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-sg-2',
            name: 'Klasik Churchill',
            description: 'Doğal maden suyu, taze sıkılmış limon suyu ve kadeh kenarında kaya tuzu.',
            price: '60 ₺',
            calories: 15,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'kfe-sg-3',
            name: 'Iced Americano',
            description: 'Buz, filtrelenmiş soğuk su ve double shot taze espresso.',
            price: '90 ₺',
            calories: 10,
            image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'kfe-sg-4',
            name: 'Iced Caffè Latte',
            description: 'Buz küpleri, soğuk süt ve üzerine dökülen taze çekilmiş espresso shot.',
            price: '105 ₺',
            calories: 130,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
            display_order: 4,
            is_available: true
          },
          {
            id: 'kfe-sg-5',
            name: 'Iced Karamel Latte',
            description: 'Karamel şurubu, buz, soğuk süt, espresso ve karamel sos ızgarası.',
            price: '115 ₺',
            calories: 190,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
            display_order: 5,
            is_available: true,
            is_featured: true
          },
          {
            id: 'kfe-sg-6',
            name: 'Affogato al Caffè',
            description: '1 top İtalyan vanilyalı dondurma üzerine dökülen sıcak taze espresso.',
            price: '120 ₺',
            calories: 170,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
            display_order: 6,
            is_available: true
          },
          {
            id: 'kfe-sg-7',
            name: 'Kutu Meşrubatlar (330ml)',
            description: 'Coca-Cola, Coca-Cola Zero, Fanta, Sprite, Fuse Tea Şeftali/Limon.',
            price: '60 ₺',
            calories: 140,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 7,
            is_available: true
          },
          {
            id: 'kfe-sg-8',
            name: 'Köpüklü Köy Yayık Ayranı',
            description: 'Hakiki tava yoğurdundan geleneksel usulde çalkalanmış soğuk ayran.',
            price: '40 ₺',
            calories: 75,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 8,
            is_available: true
          }
        ]
      }
    ]
  },

  // 2. GELENEKSEL OCAKBAŞI & ANADOLU ET MUTFAĞI
  {
    id: 'geleneksel-ocakbasi-et',
    name: 'Geleneksel Ocakbaşı & Anadolu Et Mutfağı',
    tagline: 'Meşe kömüründe dinlendirilmiş zırh kebapları, taş fırın lahmacun ve otantik mezeler',
    venueType: 'Ocakbaşı & Et Restoranı',
    icon: '🔥',
    color: '#e11d48',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    description: 'Gaziantep ve Adana yöresinin asırlık ocakbaşı geleneğini; zırhtan geçen kuzu kebapları, taş fırın çıtır lahmacun, taze meze dolabı ve Hatay künefesiyle yaşatan seçkin menü.',
    categories: [
      {
        id: 'tmpl-ko-1',
        name: 'Geleneksel Başlangıç Çorbaları',
        description: 'Günün taze kaynayan şifalı kazan çorbaları ve fırından sıcak tırnak pide',
        is_active: true,
        display_order: 1,
        items: [
          {
            id: 'item-ko-1-1',
            name: 'Geleneksel Süzme Mercimek Çorbası',
            description: 'Kıtır pide küpleri, tereyağlı pul biber sos ve taze limon dilimi ile.',
            price: '110 ₺',
            calories: 180,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
            display_order: 1,
            is_available: true
          },
          {
            id: 'item-ko-1-2',
            name: 'Gaziantep Usulü Hakiki Beyran',
            description: 'Ağır ateşte pişen lif lif kuzu gerdan eti, pirinç, sarımsak ve bol acılı kemik suyu.',
            price: '220 ₺',
            calories: 390,
            image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
            display_order: 2,
            is_available: true,
            is_featured: true
          }
        ]
      },
      {
        id: 'tmpl-ko-2',
        name: 'Soğuk Mezeler & Yöresel Salatalar',
        description: 'Günlük meze dolabımızdan taze zeytinyağlılar ve Antep cevizli salatalar',
        is_active: true,
        display_order: 2,
        items: [
          {
            id: 'item-ko-2-1',
            name: 'Antep Cevizli Gavurdağı Salatası',
            description: 'İnce kıyılmış tarla domatesi, çıtır salatalık, taze soğan, bol Antep cevizi ve hakiki nar ekşisi.',
            price: '160 ₺',
            calories: 240,
            allergens: ['Ceviz'],
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-2-2',
            name: 'Köz Patlıcan Ezme',
            description: 'Kömür ateşinde közlenmiş bostan patlıcanı, süzme yoğurt, sarımsak ve sızma zeytinyağı.',
            price: '140 ₺',
            calories: 150,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'item-ko-2-3',
            name: 'Arnavut Biberli Atom',
            description: 'Süzme yoğurt yatağında tereyağında kavrulmuş acı Arnavut biberi.',
            price: '150 ₺',
            calories: 210,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'item-ko-2-4',
            name: 'Zırh Kıymalı Antep Çiğ Köftesi',
            description: 'Geleneksel baharatlar ve ince bulgurla yoğrulmuş çiğ köfte, göbek marul ve limon ile.',
            price: '160 ₺',
            calories: 280,
            allergens: ['Gluten', 'Ceviz'],
            image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
            display_order: 4,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-ko-3',
        name: 'Sıcak Başlangıçlar & Ara Sıcaklar',
        description: 'Tereyağlı sıcak humus, çıtır Antep içli köftesi ve sıcak tabaklar',
        is_active: true,
        display_order: 3,
        items: [
          {
            id: 'item-ko-3-1',
            name: 'Kayseri Pastırmalı Sıcak Humus',
            description: 'Tahinli sıcak nohut ezmesi, tereyağında hafif sotelenmiş çemenli dana pastırma.',
            price: '190 ₺',
            calories: 340,
            allergens: ['Susam'],
            image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-3-2',
            name: 'Kızarmış Antep İçli Köfte (2 Adet)',
            description: 'Cevizli ve baharatlı dana kıyma dolgulu altın sarısı çıtır içli köfte.',
            price: '150 ₺',
            calories: 320,
            allergens: ['Gluten', 'Ceviz'],
            image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
            display_order: 2,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-ko-4',
        name: 'Ocakbaşı Kebapları & Kömürde Izgaralar',
        description: 'Meşe kömürü ateşinde dinlendirilmiş zırh kıyması et ve tavuk lezzetleri',
        is_active: true,
        display_order: 4,
        items: [
          {
            id: 'item-ko-4-1',
            name: 'Zırh Kıyması Adana Kebap',
            description: 'Erkek kuzu boşluğu ve kuyruk yağı, köz domates-biber, sumaklı soğan ve sıcak lavaş.',
            price: '340 ₺',
            calories: 710,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-4-2',
            name: 'Otantik Urfa Kebap (Acısız)',
            description: 'Özel marine kuzu kıyma kebabı, köz sebzeler, bulgur pilavı ve tırnak pide.',
            price: '340 ₺',
            calories: 700,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'item-ko-4-3',
            name: 'Marine Kuzu Çöp Şiş (8 Şiş)',
            description: 'Zeytinyağı ve kekikle dinlendirilmiş lokum kuzu eti, köz sarımsak ve pide ile.',
            price: '380 ₺',
            calories: 680,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
            display_order: 3,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-4-4',
            name: 'Özel Soslu Beyti Sarma',
            description: 'İnce lavaşa sarılmış kebap dilimleri, tava yoğurdu ve eritilmiş köpüklü tereyağı sosu.',
            price: '390 ₺',
            calories: 840,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            display_order: 4,
            is_available: true
          },
          {
            id: 'item-ko-4-5',
            name: 'Kekikli Izgara Kuzu Pirzola (4 Kalem)',
            description: 'Özel dinlendirilmiş taze kuzu pirzola, közlenmiş arpacık soğan ve biber ile.',
            price: '460 ₺',
            calories: 760,
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 5,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-4-6',
            name: 'Geleneksel Kasap Izgara Köfte',
            description: '6 adet ızgara köfte, piyaz, patates kızartması ve köz biber eşliğinde.',
            price: '290 ₺',
            calories: 590,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
            display_order: 6,
            is_available: true
          },
          {
            id: 'item-ko-4-7',
            name: 'Yoğurtlu Marine Tavuk Şiş & Kanat',
            description: 'Özel baharatlı yoğurt sosunda dinlendirilmiş ızgara tavuk şiş ve çıtır kanatlar.',
            price: '270 ₺',
            calories: 520,
            image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
            display_order: 7,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-ko-5',
        name: 'Taş Fırın Çıtır Lahmacun & Pideler',
        description: 'Odun ateşinde taş tabanda pişen incecik çıtır lahmacun ve tereyağlı pideler',
        is_active: true,
        display_order: 5,
        items: [
          {
            id: 'item-ko-5-1',
            name: 'Çıtır Antep Lahmacun',
            description: 'Zırh kıyması, sarımsak, maydanoz, domates ve çıtır incecik hamur.',
            price: '110 ₺',
            calories: 250,
            allergens: ['Gluten'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-5-2',
            name: 'Kuşbaşılı & Kaşarlı Taş Fırın Pide',
            description: 'Marine dana kuşbaşı et, salkım domates, biber ve bol erimiş kaşar peyniri.',
            price: '280 ₺',
            calories: 720,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            display_order: 2,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-ko-6',
        name: 'Geleneksel Şerbetli Tatlılar & Yöresel İçecekler',
        description: 'Hatay künefesi, Antep fıstıklı baklava, yayık ayranı ve acılı şalgam',
        is_active: true,
        display_order: 6,
        items: [
          {
            id: 'item-ko-6-1',
            name: 'Hatay Usulü Sıcak Peynirli Künefe',
            description: 'Özel tuzsuz künefe peyniri, sıcak şerbet, bol Antep fıstığı ve manda kaymağı.',
            price: '210 ₺',
            calories: 620,
            allergens: ['Gluten', 'Süt Ürünleri', 'Antep Fıstığı'],
            image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-ko-6-2',
            name: 'Fıstıklı Havuç Dilim Baklava & Kesme Dondurma',
            description: 'Çıtır sıcak havuç dilim baklava ve arasında hakiki Maraş kesme dondurması.',
            price: '240 ₺',
            calories: 580,
            allergens: ['Gluten', 'Süt Ürünleri', 'Antep Fıstığı'],
            image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'item-ko-6-3',
            name: 'Bakır Maşrapada Bol Köpüklü Yayık Ayranı',
            description: 'Taze köy yoğurdundan geleneksel usulde hazırlanmış yayık ayranı.',
            price: '45 ₺',
            calories: 85,
            allergens: ['Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'item-ko-6-4',
            name: 'Doğal Fermente Acılı Adana Şalgamı',
            description: 'Özel şişesinde acı süs biberi garnitürü ile servis edilir.',
            price: '45 ₺',
            calories: 25,
            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            display_order: 4,
            is_available: true
          }
        ]
      }
    ]
  },

  // 3. GASTROPUB, İMZA KOKTEYL & CRAFT BİRA EVİ
  {
    id: 'gastropub-kokteyl-bar',
    name: 'Gastropub, İmza Kokteyl & Craft Bira Evi',
    tagline: 'Miksoloji kokteyller, zengin dünya birası seçkisi ve paylaşımlı gurme lezzetler',
    venueType: 'Gastropub & Bar',
    icon: '🍸',
    color: '#7c3aed',
    coverImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=400&fit=crop',
    description: 'Özel reçeteli imza miksoloji kokteylleri, zengin yerli ve ithal soğuk biralar, çıtır sıcak parmak lezzetler ve el yapımı smash burgerler.',
    categories: [
      {
        id: 'tmpl-bg-1',
        name: 'Miksoloji İmza & Klasik Kokteyller',
        description: 'Barmenimizin taze meyve püreleri ve kaliteli içkilerle hazırladığı kokteyl koleksiyonu',
        is_active: true,
        display_order: 1,
        items: [
          {
            id: 'item-bg-1-1',
            name: 'Passion Fruit Martini',
            description: 'Premium votka, çarkıfelek meyvesi püresi, vanilya likörü ve yanında soğuk Prosecco kadehi.',
            price: '340 ₺',
            calories: 190,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-bg-1-2',
            name: 'İtalyan Aperol Spritz',
            description: 'Aperol, İtalyan Prosecco köpüklü şarap, maden suyu ve taze portakal dilimi.',
            price: '310 ₺',
            calories: 140,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'item-bg-1-3',
            name: 'Taze Naneli Orijinal Mojito',
            description: 'Havana beyaz rom, taze nane yaprakları, misket limonu, esmer şeker ve soda.',
            price: '290 ₺',
            calories: 180,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
            display_order: 3,
            is_available: true
          },
          {
            id: 'item-bg-1-4',
            name: 'Smokey Bourbon Whiskey Sour',
            description: 'Bourbon viski, taze limon suyu, şeker şurubu ve tütsülenmiş meşe aroması.',
            price: '330 ₺',
            calories: 195,
            image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
            display_order: 4,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-bg-2',
        name: 'Fıçı & Şişe Dünya Biraları',
        description: 'Buz gibi yerli, buğday ve ithal craft biralar',
        is_active: true,
        display_order: 2,
        items: [
          {
            id: 'item-bg-2-1',
            name: 'Bomonti Filtresiz (50cl)',
            description: 'Yumuşak içimli soğuk buğday birası.',
            price: '160 ₺',
            calories: 220,
            image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
            display_order: 1,
            is_available: true
          },
          {
            id: 'item-bg-2-2',
            name: 'Corona Extra (33cl)',
            description: 'Misket limonu dilimi ile servis edilir.',
            price: '190 ₺',
            calories: 150,
            image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
            display_order: 2,
            is_available: true
          },
          {
            id: 'item-bg-2-3',
            name: 'Erdinger Weissbier (50cl)',
            description: 'Geleneksel Alman buğday birası.',
            price: '220 ₺',
            calories: 230,
            image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
            display_order: 3,
            is_available: true
          }
        ]
      },
      {
        id: 'tmpl-bg-3',
        name: 'Paylaşımlı Sıcak Pub Sepetleri & Burgerler',
        description: 'Biranın yanına en çok yakışan sıcak parmak lezzetler ve smash burgerler',
        is_active: true,
        display_order: 3,
        items: [
          {
            id: 'item-bg-3-1',
            name: 'Mega Pub Karışık Atıştırmalık Sepeti',
            description: 'Mozzarella sticks, çıtır soğan halkaları, panelenmiş tavuk parçaları, sosis, baharatlı patates ve 3 özel dip sos.',
            price: '340 ₺',
            calories: 890,
            allergens: ['Gluten', 'Süt Ürünleri', 'Yumurta'],
            image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400',
            display_order: 1,
            is_available: true,
            is_featured: true
          },
          {
            id: 'item-bg-3-2',
            name: 'Double Smash Gastropub Burger',
            description: '2x100g smash dana köfte, duble cheddar peyniri, karamelize soğan, tütsülenmiş füme et ve trüf mayonez.',
            price: '340 ₺',
            calories: 880,
            allergens: ['Gluten', 'Süt Ürünleri'],
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            display_order: 2,
            is_available: true,
            is_featured: true
          }
        ]
      }
    ]
  }
]
