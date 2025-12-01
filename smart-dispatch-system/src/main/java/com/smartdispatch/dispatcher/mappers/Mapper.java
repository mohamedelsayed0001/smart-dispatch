package com.smartdispatch.dispatcher.mappers;
public interface Mapper<A,B>{
    B mapTO(A a);
    A mapFrom(B b);
}
