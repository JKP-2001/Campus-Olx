const { response } = require('express')
const express=require('express')
const auth=require('../middleware/auth')
const Item=require('../Models/Item')

const router=express.router()

router.post('/items',auth,async(req,res)=>{
    const item=new Item({
        ...req.body,
        owner:req.user._id
    })
    try{
        await item.save()
        res.send(item)
    }catch(error){
        res.status(401).send(error)
    }
})

router.get('/items',auth,async(req,res)=>{
    try{
        const items=await Item.find({owner:req.user._id})
        res.send(items)
    }catch(error){
        res.status(401).send(error)
    }
})

router.get('/items/:id',auth,async(req,res)=>{
    try{
        const item=Item.findOne({_id:req.params.id,owner:req.user._id})
        if(!item)return res.status(404).send()
        res.send(item)
    }catch(error){
        res.status(401).send(error)
    }
})

router.patch('/items/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description','details']
    const isValidUpdate=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidUpdate)return res.status(400).send({error:"Invalid update properties"})
    try{
        const item=Item.findOne({_id:req.params.id,owner:req.user._id})
        updates.forEach((update)=>{
            item[update]=req.body[update]
        })
        await item.save()
        res.send(item)
    }catch(error){
        res.status(500).send()
    }
})

router.delete('/items/:id',auth,async(req,res)=>{
    try{
        const item=Item.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!item)res.status(400).send()
        res.send(item)
    }catch(error){
        res.status(500).send()
    }
})

module.exports=router