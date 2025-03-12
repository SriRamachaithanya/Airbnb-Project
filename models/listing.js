const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    //    image:{
    //     // image: {
    //     //     filename: { type: String, required: true },
    //     //     url: { type: String, required: true }
    //     //   },
    //     filename:"listingimage",
    //     type:String,
    //     default:"https://unsplash.com/photos/sun-light-passing-through-green-leafed-tree-EwKXn5CapA4",
    //     set:(v) => v===" "?"https://unsplash.com/photos/sun-light-passing-through-green-leafed-tree-EwKXn5CapA4"
    //     :v,
    //  },

    image:{

        filename: { type: String, 
        default:"listing_image",
         required: true },
           url: {
          type:String,
          default:"https:unsplash.com/photos/sun-light-passing-through-green-leafed-tree-EwKXn5CapA4",
          set:(v) => v===" "?"https://unsplash.com/photos/sun-light-passing-through-green-leafed-tree-EwKXn5CapA4"
          :v,
       },},
    
    price:{
        type:Number,
        required:true
    },  

    location:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    } 
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;