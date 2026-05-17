pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/pranavmk'
    DOCKER_CRED = 'dockerhub-pranavmk'
    SONAR_CRED = 'sonar'
    SONAR_HOST = 'http://localhost:9000'
    BACKEND_BASE_URL = 'https://nexus-inventory-system-production.up.railway.app'
    BACKEND_IMAGE = "${REGISTRY}/nexus-backend:${env.GIT_COMMIT}"
    FRONTEND_IMAGE = "${REGISTRY}/nexus-frontend:${env.GIT_COMMIT}"
    BACKEND_IMAGE_LATEST = "${REGISTRY}/nexus-backend:latest"
    FRONTEND_IMAGE_LATEST = "${REGISTRY}/nexus-frontend:latest"
    MONGO_URI = 'mongodb://127.0.0.1:27017/quickCommerceDB'
    BACKEND_PID_FILE = 'backend.pid'
  }
  stages {
    stage('Checkout') {
      steps {
        git branch: 'master', url: 'https://github.com/MK23IS092/nexus-inventory-system.git'
      }
    }

    stage('Install & Test Backend') {
      steps {
        bat '''
        python -m pip install --upgrade pip
        pip install -r Backend/requirements.txt
        pip install pytest
        echo Using backend at %BACKEND_BASE_URL%
        python -m pytest -q Backend/test_api.py
        '''
      }
    }

    stage('Install & Test Frontend') {
      steps {
        bat '''
        cd frontend-react
        npm ci --legacy-peer-deps
        npm test -- --watchAll=false --passWithNoTests
        npm run build
        '''
      }
    }

    stage('OWASP Dependency Check') {
      steps {
        dependencyCheck additionalArguments: '--scan ./ --format ALL --out dependency-check-report', odcInstallation: 'DP'
      }
      post {
        always {
          dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'
          archiveArtifacts artifacts: 'dependency-check-report/**', allowEmptyArchive: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withCredentials([string(credentialsId: env.SONAR_CRED, variable: 'SONAR_TOKEN')]) {
          bat '''
          "%SCANNER_HOME%\\bin\\sonar-scanner.bat" ^
            -Dsonar.projectKey=nexus-inventory-system ^
            -Dsonar.projectName=nexus-inventory-system ^
            -Dsonar.host.url=http://localhost:9000 ^
            -Dsonar.login=%SONAR_TOKEN% ^
            -Dsonar.sources=Backend,frontend-react/src ^
            -Dsonar.exclusions=**/node_modules/**,**/build/**,**/__pycache__/**,**/*.pyc
          '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        bat '''
        docker build -t docker.io/pranavmk/nexus-backend:%GIT_COMMIT% -t docker.io/pranavmk/nexus-backend:latest -f Dockerfile .
        docker build -t docker.io/pranavmk/nexus-frontend:%GIT_COMMIT% -t docker.io/pranavmk/nexus-frontend:latest -f frontend-react/Dockerfile frontend-react
        '''
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat '''
          echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
          docker push docker.io/pranavmk/nexus-backend:%GIT_COMMIT%
          docker push docker.io/pranavmk/nexus-backend:latest
          docker push docker.io/pranavmk/nexus-frontend:%GIT_COMMIT%
          docker push docker.io/pranavmk/nexus-frontend:latest
          '''
        }
      }
    }

    stage('Deploy Frontend to Vercel') {
      steps {
        withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
          bat '''
          cd frontend-react
          if not exist .vercel mkdir .vercel
          powershell -NoProfile -Command "$json = '{\"projectId\":\"prj_TE3hanu3sHZ2kHUzCp3T7tUfCyAb\",\"orgId\":\"team_GpO5D543HdVwuCLjif4rqt4W\"}'; Set-Content -Path .vercel\\project.json -Value $json -Encoding ASCII"
          npx --yes vercel deploy --prod --yes --token %VERCEL_TOKEN%
          '''
        }
      }
    }

    stage('Backend Deploy Note') {
      steps {
        echo 'Backend Docker image pushed to DockerHub. Configure Railway to pull docker.io/pranavmk/nexus-backend:latest or auto-deploy from master.'
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
