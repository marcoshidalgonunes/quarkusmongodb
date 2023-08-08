package org.quarkusmongodb.models;

import org.bson.types.ObjectId;

import io.quarkus.mongodb.panache.common.MongoEntity;

@MongoEntity(collection="Books")
public class Book {
    public ObjectId id; // used by MongoDB for the _id field

    public String Name;

    public Double Price;

    public String Category;

    public String Author;
}
