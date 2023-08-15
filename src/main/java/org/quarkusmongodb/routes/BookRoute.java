package org.quarkusmongodb.routes;

import java.util.List;

import org.quarkusmongodb.models.Book;
import org.quarkusmongodb.repositories.BookRepository;

import io.quarkus.vertx.web.Route;
import io.quarkus.vertx.web.RouteBase;
import jakarta.inject.Inject;

@RouteBase(path = "api")
public class BookRoute {
    @Inject
    private BookRepository bookRepository;

    @Route(path = "/Books", methods = Route.HttpMethod.GET) 
    List<Book> getAll() {
        return bookRepository.listAll();
    }
}
