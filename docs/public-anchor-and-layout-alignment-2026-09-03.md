# Correctifs de navigation et de gabarit public

## Constat

Les sections `formule`, `pourquoi`, `partenaires` et `faq` existent bien dans `Home.tsx`. Elles ne sont toutefois pas encore présentes lorsque le navigateur traite une URL directe telle que `/#formule` : l’accueil est rendu ensuite par React. Le navigateur ne réapplique pas systématiquement le déplacement vers l’ancre après ce rendu asynchrone, ce qui laisse le visiteur en haut de page.

La page index de l’accueil utilise la classe `.container`, plafonnée à `78rem` avec un padding latéral progressif. Les pages publiques de formations rendues côté serveur utilisent une enveloppe de contenu pouvant atteindre `1440px`, d’où une largeur de lecture et un rythme d’espacement différents.

## Décisions de correction

Le composant d’accueil appliquera un défilement contrôlé au chargement et à chaque changement de hash, après que les sections ont été montées. Les liens gardent des URL partageables (`/#formule`, etc.) et un mouvement accessible, avec compensation pour le header fixe.

Les contenus et héros des pages publiques de formations utiliseront une nouvelle enveloppe `content-shell` qui reproduit le référentiel de l’accueil : largeur maximale de `78rem`, marges automatiques et padding latéral progressif. L’en-tête et le footer conservent leur largeur de navigation indépendante afin de préserver les alignements du menu déjà validés.

## Validation locale

Les contrôles directs de `/#formule` et `/#faq` ont été rejoués après chargement de l’accueil : le navigateur se positionne respectivement sur les sections **La Formule complète** et **Questions fréquentes**, malgré le montage asynchrone de l’application. Les quatre identifiants de navigation sont couverts par le contrat `homePublicAnchorIds`.

Les captures desktop et mobile de l’index Formations et du domaine Informatique & Développement confirment une même enveloppe de lecture : `78rem` au maximum, padding progressif identique à l’accueil et passage à `1rem` sur mobile. Aucun débordement horizontal n’a été observé à 390 px. Le typage, 549 tests et les sept contrôles de la matrice de publication sont passés.
