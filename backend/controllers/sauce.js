//Imports
const Sauce = require('../models/sauce');
const fs = require('fs');
const user = require('../models/user');

//Méthode pour créer une sauce
exports.createSauce = (req,res,next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
      likes: 0,
      dislikes: 0
    })
    sauce
      .save()
      .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
      .catch((error) => res.status(400).json({ error }))
  };

  //Méthode pour afficher les sauces
exports.displaySauces = (req,res,next)=>{
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
  };

  //Méthode pour afficher une sauce
  exports.displaySauce = (req, res, next)=>{
      Sauce.findOne({_id: req.params.id})
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(400).json({ error }));
  }

  //Méthode pour modifier une sauce
  exports.modifySauce = (req, res, next)=>{
    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
  }

  //Méthode pour supprimer une sauce
  exports.deleteSauce = (req, res , next)=>{
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
        .catch(error => res.status(500).json({ error }));
  }

  //Méthode pour like/dislike une sauce
  exports.like = (req, res, next)=>{
    const like = req.body.like;
    const userId = req.body.userId;

    if (like == 1){
      Sauce.updateOne({_id: req.params.id}, {$addToSet: {usersLiked : userId}, $inc : {likes : +1}})
        .then(()=>res.status(200).json({message:"aime la sauce!"}))
        .catch(error => res.status(400).json({ error }));

    }else if(like == -1){
      Sauce.updateOne({_id: req.params.id}, {$addToSet: {usersDisliked : userId}, $inc : {dislikes : +1}})
        .then(()=>res.status(200).json({message:"n'aime pas la sauce!"}))
        .catch(error => res.status(400).json({ error }));

    }else{
      Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
          if (sauce.usersLiked.includes(userId)){
            Sauce.updateOne({_id: req.params.id}, {$pull: {usersLiked : userId}, $inc : {likes : -1}})
              .then(()=>res.status(200).json({message:"Avis annulé"}))
              .catch(error => res.status(400).json({ error }));

          }else if(sauce.usersDisliked.includes(userId)){
            Sauce.updateOne({_id: req.params.id}, {$pull: {usersDisliked : userId}, $inc : {dislikes : -1}})
              .then(()=>res.status(200).json({message:"Avis annulé !"}))
              .catch(error => res.status(400).json({ error }));
              
          }
        })
        .catch(error => res.status(400).json({ error }));
    }
  }