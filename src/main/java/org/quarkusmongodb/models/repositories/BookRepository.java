package org.quarkusmongodb.models.repositories;

import org.quarkusmongodb.models.Book;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class BookRepository implements PanacheMongoRepository<Book> {

}
