const express=require('express');
const mongoose=require('mongoose')
const MongoStore=require('connect-mongo');
const bcrypt=require('bcrypt');
const multer=require('multer');
const session=require('express-session');
const app=express();
const path=require('path');
const { createDiffieHellmanGroup } = require('crypto');
const { symlink } = require('fs');
const port=3001;

app.set('view engine','ejs');
app.set('views','views');

app.use(express.urlencoded({extended:false}));
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://127.0.0.1:27017/BlogDB')
.then(()=>console.log('monogdb is connected'))
.catch((err)=>console.log(err));

const userSchema=mongoose.Schema({
  username:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true}
});

const Users=mongoose.model('Users',userSchema);

const blogSchema=mongoose.Schema({
  image:{type:String,required:true},
  title:{type:String,required:true},
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'Users'}
});

const Blogs=mongoose.model('Blogs',blogSchema);

app.use(session({
  secret:'secretkey',
  resave:false,
  saveUninitialized:false,
  store:MongoStore.create({mongoUrl:'mongodb://127.0.0.1:27017/BlogDB'}),
  cookie:{maxAge:1000*60*60}
}));

const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,'uploads'),
  filename:(req,file,cb)=>{
    cb(null,Date.now()+path.extname(file.originalname));
  }
});

const upload=multer({
  storage:storage,
  limits:{fileSize:1024*1024*10}
});

app.get('/login',(req,res)=>{
  res.render('login');
});
app.get('/register',(req,res)=>{
  res.render('register');
});
app.post('/register',async(req,res)=>{
  const {username,email,password}=req.body;
  const hashed=await bcrypt.hash(password,10);
  await Users.create({username,email:email.toLowerCase(),password:hashed});
  res.redirect('/login');
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) return res.send('No data found');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Invalid password');
    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Something went wrong');
  }
});

function isAuth(req,res,next){
  if(req.session.userId){
    next();
  }else{
    res.redirect('/login');
  }
}

app.get('/',isAuth,(req,res)=>{
  res.redirect('/dashboard');
});
app.get('/dashboard', isAuth, async (req, res) => {
  const user = await Users.findById(req.session.userId);

  // Fetch blogs and populate user info
  const blogs = await Blogs.find({ userId: req.session.userId }).populate('userId');

  res.render('dashboard', {
    username: user.username,
    email: user.email,
    blogs: blogs
  });
});

app.get('/add-blog',isAuth,(req,res)=>{
  res.render('add-blog');
});
app.post('/add-blog',isAuth,upload.single('image'),async(req,res)=>{
  try{
  const {title}=req.body;
  const image=req.file.filename;
  await Blogs.create({title,image,userId:req.session.userId});
  res.redirect('/add-blog');
  }catch(err){
    console.log(err);
    res.send('Error While Adding Data');
  }

});
app.get('/update/:id',isAuth,async(req,res)=>{
  const blogs=await Blogs.findById(req.params.id);
  res.render('update',{blogs:blogs});
});
app.post('/update/:id', isAuth, upload.single('image'), async (req, res) => {
  const { title } = req.body;
  const updateData = { title };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  await Blogs.findByIdAndUpdate(req.params.id, updateData);
  res.redirect('/');
});

app.get('/delete/:id',isAuth,async(req,res)=>{
 await Blogs.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
  res.redirect('/');
});
app.get('/logout',isAuth,(req,res)=>{
  req.session.destroy(()=>res.redirect('/login'));
});
app.listen(port,()=>{
  console.log(`server is runninf at http://localhost:${port}`)
});