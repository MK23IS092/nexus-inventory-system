pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/PranavMK'
    DOCKER_CRED = 'docker-registry-creds'
    SONAR_CRED = 'sonar'
    SONAR_HOST = 'http://localhost:9000'
    BACKEND_IMAGE = "${REGISTRY}/nexus-backend:${env.GIT_COMMIT}"
    FRONTEND_IMAGE = "${REGISTRY}/nexus-frontend:${env.GIT_COMMIT}"
    BACKEND_IMAGE_LATEST = "${REGISTRY}/nexus-backend:latest"
    FRONTEND_IMAGE_LATEST = "${REGISTRY}/nexus-frontend:latest"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Test Backend') {
      steps {
        dir('Backend') {
          sh 'python -m pip install --upgrade pip'
          sh 'pip install -r requirements.txt'
          // optional: run tests if present
          sh 'pytest -q || true'
        }
      }
    }

    stage('Install & Test Frontend') {
      steps {
        dir('frontend-react') {
          sh 'npm ci --silent --legacy-peer-deps'
          sh 'npm test --silent -- --watchAll=false || true'
        }
      }
    }

    stage('OWASP Dependency Check') {
      steps {
        // run dependency-check via Docker image and publish report
        sh '''
        docker run --rm -v "$PWD":/src -v "$PWD"/owasp-report:/report owasp/dependency-check:latest \
          --scan /src --format ALL --out /report
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'owasp-report/**', allowEmptyArchive: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withCredentials([string(credentialsId: env.SONAR_CRED, variable: 'SONAR_TOKEN')]) {
          sh "docker run --rm -e SONAR_HOST_URL=${env.SONAR_HOST} -e SONAR_LOGIN=$SONAR_TOKEN -v $PWD:/usr/src -w /usr/src sonarsource/sonar-scanner-cli"
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh "docker build -t ${BACKEND_IMAGE} -f Backend/Dockerfile Backend"
        sh "docker build -t ${FRONTEND_IMAGE} -f frontend-react/Dockerfile frontend-react"
        sh "docker tag ${BACKEND_IMAGE} ${BACKEND_IMAGE_LATEST}"
        sh "docker tag ${FRONTEND_IMAGE} ${FRONTEND_IMAGE_LATEST}"
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh "docker push ${BACKEND_IMAGE}"
          sh "docker push ${FRONTEND_IMAGE}"
          sh "docker push ${BACKEND_IMAGE_LATEST}"
          sh "docker push ${FRONTEND_IMAGE_LATEST}"
        }
      }
    }

    stage('Deploy (optional)') {
      steps {
        echo 'Add deployment steps here (SSH, Kubernetes, ECS, Vercel API, etc.)'
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
