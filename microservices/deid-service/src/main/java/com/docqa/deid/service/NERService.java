package com.docqa.deid.service;

import opennlp.tools.namefind.NameFinderME;
import opennlp.tools.namefind.TokenNameFinderModel;
import opennlp.tools.tokenize.SimpleTokenizer;
import opennlp.tools.util.Span;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class NERService {

    private final NameFinderME nameFinder;

    public NERService() throws Exception {
        try (InputStream modelStream = getClass().getResourceAsStream("/models/en-ner-person.bin")) {
            TokenNameFinderModel model = new TokenNameFinderModel(modelStream);
            this.nameFinder = new NameFinderME(model);
        }
    }

    public List<String> extractSensitiveData(String documentText) {
        SimpleTokenizer tokenizer = SimpleTokenizer.INSTANCE;
        String[] tokens = tokenizer.tokenize(documentText);
        Span[] nameSpans = nameFinder.find(tokens);
        
        List<String> names = new ArrayList<>();
        for (Span span : nameSpans) {
            names.add(String.join(" ", java.util.Arrays.copyOfRange(tokens, span.getStart(), span.getEnd())));
        }
        return names;
    }
}