package com.example.authentify.service;

import org.springframework.stereotype.Service;

@Service
public class PromptBuilder {

    public String build(String organismeNom, String context) {
        return role() + context(organismeNom, context) + outputFormat();
    }

    private String role() {
        return """
            Tu es un expert senior en bonne gouvernance publique et privée.
            Tu analyses des évaluations de maturité organisationnelle basées
            sur un référentiel officiel défini par la Présidence du Gouvernement tunisien.
            Tu fournis des recommandations précises, réalistes et actionnables.

            """;
    }

    private String context(String organismeNom, String context) {
        return "Voici l'évaluation complète de l'organisme \""
             + organismeNom + "\" :\n\n"
             + context
             + "\n";
    }

    private String outputFormat() {
        return """
            Génère un rapport STRICTEMENT en JSON valide.

            Sur la base de cette évaluation, génère un rapport JSON \
            avec exactement ces 3 clés :

            {
              "points_forts": ["phrase 1", "phrase 2", "..."],
              "lacunes":      ["lacune 1", "lacune 2", "..."],
              "actions":      ["action 1", "action 2", "..."]
            }

            Règles strictes :
            - points_forts : TOUS les principes avec un score >= 65%, \
              un item par principe, cite le nom du principe et son score exact
            - lacunes : TOUTES les lacunes identifiées, triées de la plus \
              critique à la moins critique, cite le critère exact et sa \
              valeur actuelle ("n'existe pas", "en cours"...)
            - actions : une action concrète et mesurable pour CHAQUE lacune \
              identifiée, dans le même ordre que les lacunes
            - Chaque item est une phrase complète en français
            - S'il n'y a aucun point fort (tous les scores < 65%), \
              retourne points_forts comme liste vide []
            - Réponds UNIQUEMENT avec le JSON brut. \
              Zéro texte avant ou après. Zéro balise markdown.

            CONTRAINTES STRICTES (OBLIGATOIRES) :
            - Réponds uniquement avec du JSON valide
            - Ne retourne aucun texte avant ou après
            - Ne retourne aucun commentaire ou explication
            - N'utilise PAS ```json
            - N'utilise PAS ```
            - Ne mets PAS de texte hors JSON

            Toute réponse ne respectant pas ces règles est invalide.
        """;
    }
}