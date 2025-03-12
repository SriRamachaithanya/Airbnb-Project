const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust1";

main().then(()=>{
    console.log("connectad to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// app.use(express.static('public'));



app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

//index route
app.get("/listings",async(req,res)=>{
    const allListings=await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    
    });
//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});  

    
//show route 
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
  
} );  

//create route
// app.post("/listings",async(req,res)=>{
//     const newListing= new Listing(req.body.listings);
//     await newListing.save();
//     res.redirect("/listings");
   
// })
// app.post("/listings", async (req, res) => {
//     try {
//         await Listing.insertMany(req.body.listings); 
//         res.redirect("/listings");
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Failed to save listings");
//     }
// });

app.post("/listings", async (req, res) => {
    try {
        await Listing.insertMany(req.body.listing); 
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to save listings");
    }
});

//edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

// app.get("/listings/:id", async (req, res) => {
//     try {
//         const listing = await Listing.findById(req.params.id);
//         if (!listing) {
//             return res.status(404).send("Listing not found");
//         }
//         res.render("listings/show", { listing });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server Error");
//     }
// });

//update route
app.put("/listings/:id",async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listings});
    res.redirect(`/listings/${id}`);
});

//delete route
// app.delete("/listings/:id",async(req,res)=>{
//     let {id}=req.params;
//     let deletedListing = await  Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// });



app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send("Invalid ID");

    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) return res.status(404).send("Listing not found");

    res.redirect("/listings");
});


// app.delete("/listings/:id", async (req, res) => {
//     try {
//         let { id } = req.params;
//         id = id.trim(); // Remove spaces

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).send("Invalid ID format");
//         }

//         let deletedListing = await Listing.findByIdAndDelete(id);

//         if (!deletedListing) {
//             return res.status(404).send("Listing not found");
//         }

//         console.log(deletedListing);
//         res.redirect("/listings");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server error");
//     }
// });























// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"calangute,goa",
//         country:"India",
//     });
//      await sampleListing.save();
//      console.log("Listing saved");
//      res.send("succesfull testing");

// });

app.listen(8080,()=>{
    console.log("Server is listing to the 8080 port");
});