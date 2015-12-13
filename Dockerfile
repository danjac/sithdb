FROM golang

ADD . /go/src/github.com/danjac/sithdb 

WORKDIR /go/src/github.com/danjac/sithdb 

RUN echo $(cat /etc/hosts)
RUN curl -sL https://deb.nodesource.com/setup_0.10 | bash -
RUN apt-get install -y build-essential 
RUN apt-get install -y nodejs 
RUN go get github.com/tools/godep
RUN make

CMD ./bin/serve

