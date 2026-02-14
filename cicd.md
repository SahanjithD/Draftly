flowchart LR
  %% Left-to-right CI/CD flow
  dev[Developer]
  repo[GitHub Repo\nSahanjithD/Draftly (main)]
  hub[(Docker Hub\nRegistry)]

  dev --> repo

  %% Jenkins pipeline
  subgraph CI[Jenkins Pipeline]
    direction LR
    S1[Clone Repository]
    S2[Build Frontend Image\nfrontend/Dockerfile]
    S3[Build Backend Image\nbackend/Dockerfile]
    S4[Push Images to Docker Hub\nwith dockerhub-credentials]
    S5[Clean Up\n(docker image prune -f)]
    S1 --> S2 --> S3 --> S4 --> S5
  end

  %% Orchestration / Deployment
  subgraph DEPLOY[Deployment Environment (Docker Compose)]
    direction LR
    FE[Frontend\nReact/Node (3000)]
    BE[Backend\nNode/Express (5000)]
    DB[(MongoDB 7\n(27017))]
    FE --> BE --> DB
  end

  %% Connectivity between systems
  repo --> S1flowchart LR
  %% Left-to-right CI/CD flow
  dev[Developer]
  repo[GitHub Repo\nSahanjithD/Draftly (main)]
  hub[(Docker Hub\nRegistry)]

  dev --> repo

  %% Jenkins pipeline
  subgraph CI[Jenkins Pipeline]
    direction LR
    S1[Clone Repository]
    S2[Build Frontend Image\nfrontend/Dockerfile]
    S3[Build Backend Image\nbackend/Dockerfile]
    S4[Push Images to Docker Hub\nwith dockerhub-credentials]
    S5[Clean Up\n(docker image prune -f)]
    S1 --> S2 --> S3 --> S4 --> S5
  end

  %% Orchestration / Deployment
  subgraph DEPLOY[Deployment Environment (Docker Compose)]
    direction LR
    FE[Frontend\nReact/Node (3000)]
    BE[Backend\nNode/Express (5000)]
    DB[(MongoDB 7\n(27017))]
    FE --> BE --> DB
  end

  %% Connectivity between systems
  repo --> S1flowchart LR
  %% Left-to-right CI/CD flow
  dev[Developer]
  repo[GitHub Repo\nSahanjithD/Draftly (main)]
  hub[(Docker Hub\nRegistry)]

  dev --> repo

  %% Jenkins pipeline
  subgraph CI[Jenkins Pipeline]
    direction LR
    S1[Clone Repository]
    S2[Build Frontend Image\nfrontend/Dockerfile]
    S3[Build Backend Image\nbackend/Dockerfile]
    S4[Push Images to Docker Hub\nwith dockerhub-credentials]
    S5[Clean Up\n(docker image prune -f)]
    S1 --> S2 --> S3 --> S4 --> S5
  end

  %% Orchestration / Deployment
  subgraph DEPLOY[Deployment Environment (Docker Compose)]
    direction LR
    FE[Frontend\nReact/Node (3000)]
    BE[Backend\nNode/Express (5000)]
    DB[(MongoDB 7\n(27017))]
    FE --> BE --> DB
  end

  %% Connectivity between systems
  repo --> S1
  S4 --> hub
  hub -. pull images .-> FE
  hub -. pull images .-> BE
  S4 --> hub
  hub -. pull images .-> FE
  hub -. pull images .-> BE
  S4 --> hub
  hub -. pull images .-> FE
  hub -. pull images .-> BE