package org.quarkusmongodb.routes;

import java.util.List;

import org.bson.types.ObjectId;
import org.quarkusmongodb.models.Book;
import org.quarkusmongodb.repositories.BookRepository;

import io.quarkus.vertx.web.Body;
import io.quarkus.vertx.web.Param;
import io.quarkus.vertx.web.Route;
import io.quarkus.vertx.web.RouteBase;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;

@RouteBase(path = "api")
public class BookRoute {
    @Inject
    private BookRepository bookRepository;

    @Route(path = "/Books", methods = Route.HttpMethod.GET) 
    List<Book> getAll() {
        return bookRepository.listAll();
    }

    @Route(path = "/Books/:criteria/:search", methods = Route.HttpMethod.GET) 
    List<Book> getByCriteria(@Param String criteria, @Param String search) {
        String query = String.format("{ '%s': /%s/ }", criteria, search);
        return bookRepository.find(query).list();
    }

    @Route(path = "/Books/:id", methods = Route.HttpMethod.GET) 
    Book getById(@Param String id) {
        return bookRepository.findById(new ObjectId(id));
    }

    @Route(path = "/Books", methods = Route.HttpMethod.POST) 
    Uni<Book> create(@Body Book book) {
         bookRepository.persist(book);
         return Uni.createFrom().item(book);
    }   

    @Route(path = "/Books", methods = Route.HttpMethod.PUT) 
    Uni<Void> update(@Body Book book) {
         bookRepository.update(book);
         return Uni.createFrom().nullItem();
    }   

    @Route(path = "/Books/:id", methods = Route.HttpMethod.DELETE) 
    Uni<Void> delete(@Param String id) {
        bookRepository.deleteById(new ObjectId(id));
         return Uni.createFrom().nullItem();
    }
}
