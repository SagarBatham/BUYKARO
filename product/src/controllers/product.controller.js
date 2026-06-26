const { default: mongoose } = require('mongoose')
const productModel = require('../model/product.model')
const { uploadImage } = require('../services/imageService')
const { publishToQueue } = require('../broker/broker')

async function createProduct(req, res) {
  try {
    const { title, description, price, currency } = req.body
    const seller = req.user && req.user.id
    if (!seller) return res.status(401).json({ message: 'unauthorized' })

    const files = req.files || []
    // pass the multer file object so uploadImage can use originalname and buffer
    const images = await Promise.all(files.map(file => uploadImage(file)))

    // normalize price which may be a primitive or object
    const amount = (typeof price === 'object' && price !== null) ? Number(price.amount) : Number(price)
    const curr = (typeof price === 'object' && price !== null && price.currency) ? price.currency : (currency || 'INR')

    const product = await productModel.create({
      title,
      description,
      price: { amount, currency: curr },
      seller,
      images
    })

    await publishToQueue0("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED",product)

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
}

async function getProducts(req, res) {
  try {
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query

    const filter = {}

    if (q) {
      filter.$text = { $search: q }
    }

    if (minprice) {
      filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
    }

    if (maxprice) {
      filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxprice) }
    }

    const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit)), 20)

    return res.status(200).json({
      data: products
    })

  } catch (error) {
    return res.status(401).json({
      message: error.message
    })
  }
}

async function getProductsbyID(req, res) {
  const { id } = req.params;

  const product = await productModel.findById(id)

  if (!product) {
    return res.status(404).json({
      message: "Product Not Founf"
    })
  }

  return res.status(200).json({
    message: "Prodcut fetched Successfully",
    product: product
  })
}

async function updateProducts(req, res) {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Not Valid Id" })
  }

  const product = await productModel.findOne({
    _id: id
    ,seller: req.user.id
  })

  if(!product){
    return res.status(404).json({
      message:"Product not Found"
    })
  }

  const allowedUpdates=['title','description' ,'price'];
  for(const key of Object.keys(req.body)){
    if(allowedUpdates.includes(key)){
      if(key=='price' && typeof req.body.price=='object'){
        if(req.body.price.amount !=undefined){
          product.price.amount=Number(req.body.price.amount)
        }
        if(req.body.price.currency !=undefined){
          product.price.currency=req.body.price.currency
        }
      }else{
        product[key] = req.body[ key ]
      }
    }
  }

  await product.save()
  return res.status(200).json({
    message:"Product Updated",
    product:product
  })
}

async function deleteProducts(req,res) {
  const{ id }=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({message:"Invalid Product"})
  }
  const product=await productModel.findOne({
    _id:id
  })
  if(!product){
    return res.status(404).json({
      message:"Product Not Found"
    })
  }

  if(product.seller.toString()!=req.user.id){
    return res.status(404).json({message:"You Can only Delete your product"})
  }

  await productModel.findOneAndDelete({_id:id})
  return res.status(200).json({
    message:'Product deleted Successfully'
  })
}

async function getProductsbySeller(req, res) {
  try {
    console.log('IN getProductsbySeller', { user: req.user, query: req.query })
    const sellerId = req.user && req.user.id
    if (!sellerId) return res.status(401).json({ message: 'unauthorized' })

    const { skip = 0, limit = 20 } = req.query

    const products = await productModel
      .find({ seller: sellerId })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20))

    return res.status(200).json({ product: products })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error.message })
  }
}
module.exports = { createProduct, getProducts, getProductsbyID, updateProducts, deleteProducts, getProductsbySeller}
