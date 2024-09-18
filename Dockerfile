# Utiliza a imagem do Node.js versão 16 como base, necessária para rodar o projeto de extensão para web
FROM node:16

# Define o diretório de trabalho dentro do container, onde o código da extensão será armazenado
WORKDIR /usr/src/app

# Copia os arquivos de dependências package.json e package-lock.json para o container, 
# garantindo que o ambiente tenha acesso às bibliotecas e ferramentas corretas
COPY package*.json ./

# Executa a instalação das dependências do projeto, como bibliotecas JavaScript e ferramentas de build necessárias
RUN npm install

# Copia todo o código da extensão (HTML, CSS, JS e outros arquivos) para o diretório de trabalho do container
COPY . .

# Expõe a porta 3000 para acessar a extensão (caso haja algum servidor local em uso)
EXPOSE 3000

# Executa o comando para rodar a extensão no modo de desenvolvimento, permitindo ver mudanças em tempo real
CMD ["npm", "run", "dev"]
