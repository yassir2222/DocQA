package com.docqa.deid.config;

import opennlp.tools.namefind.NameFinderME;
import opennlp.tools.namefind.TokenNameFinderModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class OpenNLPConfig {

    @Bean
    public NameFinderME nameFinder() throws Exception {
        try (InputStream modelStream = getClass().getResourceAsStream("/models/en-ner-person.bin")) {
            TokenNameFinderModel model = new TokenNameFinderModel(modelStream);
            return new NameFinderME(model);
        }
    }
}