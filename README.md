# Book Catalog

Catálogo de livros feito com Rails, Inertia e React, com importação de dados da Open Library.

## Kubernetes local

Roda a imagem de produção do projeto (`Dockerfile` da raiz) num cluster Kubernetes local com o kind. Os manifests ficam em `k8s/`.

### Manifests

| Arquivo              | Função                                                              |
| -------------------- | ------------------------------------------------------------------- |
| `configmap.yml`      | `DB_HOST`, `SOLID_QUEUE_IN_PUMA`, `HTTP_PORT` e `RAILS_LOG_LEVEL`   |
| `secret.example.yml` | Modelo do Secret. Só referência, não aplicar.                       |
| `pvc.yml`            | Volume de 5Gi para `/rails/storage`, onde ficam as capas            |
| `deployment.yml`     | App Rails com 1 réplica, porta 8080 e probes em `/up`               |
| `service.yml`        | Expõe a app na porta 80 dentro do cluster                           |
| `postgres.yml`       | PostgreSQL 17 com volume próprio, só para uso local                 |
| `ingress.yml`        | Ingress nginx. Não é usado no kind, que não tem Ingress controller. |

### Pré-requisitos

- Docker
- `kubectl`
- `kind`, com um cluster criado (`kind create cluster`). O cluster padrão se chama `kind`.

### Subir o ambiente

Rode a partir da raiz do projeto.

1. Gerar a imagem e carregar no cluster:

   ```bash
   docker build -t book_catalog:latest .
   kind load docker-image book_catalog:latest
   ```

2. Criar o Secret (só na primeira vez):

   ```bash
   kubectl create secret generic book-catalog \
     --from-file=RAILS_MASTER_KEY=config/master.key \
     --from-literal=BOOK_CATALOG_DATABASE_PASSWORD=senha-local
   ```

3. Subir o Postgres e esperar ficar pronto:

   ```bash
   kubectl apply -f k8s/postgres.yml
   kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s
   ```

4. Subir a aplicação:

   ```bash
   kubectl apply -f k8s/configmap.yml -f k8s/pvc.yml -f k8s/deployment.yml -f k8s/service.yml
   kubectl rollout status deployment/book-catalog
   ```

5. Acessar:

   ```bash
   kubectl port-forward svc/book-catalog 3000:80
   ```

   Acesse em http://localhost:3000.

> [!WARNING]
> Não use `kubectl apply -f k8s/`: aplicar a pasta inteira inclui o `secret.example.yml` e substitui o Secret real pelos valores de exemplo. Aplique os arquivos um a um, como acima.

### Atualizar depois de mudar o código

```bash
docker build -t book_catalog:latest .
kind load docker-image book_catalog:latest
kubectl rollout restart deployment/book-catalog
```

### Rodar comandos no container

```bash
kubectl exec -it deployment/book-catalog -- ./bin/rails console
kubectl exec -it deployment/book-catalog -- ./bin/rails console --sandbox
kubectl exec -it deployment/book-catalog -- bash
kubectl exec -it statefulset/postgres -- psql -U book_catalog book_catalog_production
```

### Status e logs

```bash
kubectl get pods
kubectl logs -f deployment/book-catalog
kubectl describe pod -l app=book-catalog
```

### Desligar

| Comando                                                   | Efeito                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| `kubectl delete -f k8s/deployment.yml -f k8s/service.yml` | Remove a app e mantém o banco e as capas.                  |
| `kubectl delete -f k8s/postgres.yml`                      | Remove o Postgres. O volume dele continua existindo.       |
| `kind delete cluster`                                     | Apaga o cluster inteiro, **inclusive o banco e as capas**. |

### Observações

- **Jobs:** o Solid Queue roda dentro do Puma (`SOLID_QUEUE_IN_PUMA=true`), então não existe um pod separado para os jobs.
- **Uma réplica:** as capas ficam em disco local num volume `ReadWriteOnce`, por isso o Deployment usa 1 réplica e a estratégia `Recreate`. Para escalar, é preciso trocar o Active Storage para S3, mover o Solid Queue para um Deployment próprio (`./bin/jobs`) e as migrações para um initContainer ou Job.
- **Imagem:** o build instala o Node 24 só no estágio `build`, para o Vite compilar os assets. A imagem final não tem Node nem `node_modules`.
- **Cluster real:** a imagem precisa vir de um registry, com uma tag de versão. Dá para trocar na hora do deploy com `kubectl set image deployment/book-catalog web=<registry>/book_catalog:<versao>`, ou com Kustomize.
- **Dev container:** rode `kind` e `kubectl` no host, não dentro do dev container, que não tem acesso ao Docker do host.
