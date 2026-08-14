import * as XLSX from 'xlsx'

const rows = [
  {
    name: 'Intel Core i7-14700K',
    category: 'CPU',
    price: '34999',
    originalPrice: '37999',
    brand: 'Intel',
    stock: 12,
    specs: '20 Cores, 5.6GHz Boost, LGA1700, 125W',
    description: 'A high-performance desktop processor built for gaming and content creation.',
    shortDescription: '20-core desktop processor with 5.6GHz boost clock',
    image: '/placeholder.jpg',
    featured: 'TRUE',
    status: 'active',
  },
  {
    name: 'NVIDIA RTX 4060 Ti',
    category: 'GPU',
    price: '39999',
    originalPrice: '',
    brand: 'NVIDIA',
    stock: 8,
    specs: '8GB GDDR6X, DLSS 3, Ray Tracing, 160W',
    description: 'Great 1440p gaming performance with AI-powered DLSS 3 upscaling.',
    shortDescription: '8GB GDDR6X GPU with DLSS 3',
    image: '/placeholder.jpg',
    featured: 'FALSE',
    status: 'active',
  },
  {
    name: 'Kingston Fury Beast 16GB DDR4',
    category: 'RAM',
    price: '3499',
    originalPrice: '',
    brand: 'Kingston',
    stock: 40,
    specs: '1x16GB, DDR4-3200, CL16',
    description: 'Reliable high-performance memory for everyday builds.',
    shortDescription: '16GB DDR4-3200 memory module',
    image: '/placeholder.jpg',
    featured: 'FALSE',
    status: 'active',
  },
]

const worksheet = XLSX.utils.json_to_sheet(rows, {
  header: [
    'name',
    'category',
    'price',
    'originalPrice',
    'brand',
    'stock',
    'specs',
    'description',
    'shortDescription',
    'image',
    'featured',
    'status',
  ],
})
worksheet['!cols'] = [
  { wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 13 }, { wch: 12 }, { wch: 8 },
  { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 16 }, { wch: 10 }, { wch: 10 },
]

const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
XLSX.writeFile(workbook, 'sample-products.xlsx')
console.log('Wrote sample-products.xlsx')
