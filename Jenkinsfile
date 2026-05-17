pipeline {
  agent any
  environment {
    SONAR_CRED = 'sonar'
    SONAR_HOST = 'http://localhost:9000'
    BACKEND_BASE_URL = 'https://nexus-inventory-system-production.up.railway.app'
    RAILWAY_TOKEN = '94c309cc-5a6e-46f1-8644-b4b07fca314a'
    RAILWAY_PROJECT = 'nexus-inventory-system'
    RAILWAY_SERVICE = 'backend'
    RAILWAY_ENVIRONMENT = 'production'
    VERCEL_CRED = 'vercel-token'
    VERCEL_PROJECT_ID = 'prj_TE3hanu3sHZ2kHUzCp3T7tUfCyAb'
    VERCEL_ORG_ID = 'team_GpO5D543HdVwuCLjif4rqt4W'
    MONGO_URI = 'mongodb://127.0.0.1:27017/quickCommerceDB'
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
        bat 'if not exist dependency-check-report mkdir dependency-check-report'
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
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          withSonarQubeEnv('PranavMK') {
            script {
              def sonarScannerHome = tool name: 'Sonar-server', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
              echo "Resolved Sonar scanner: ${sonarScannerHome}"
              echo "Sonar host URL: ${env.SONAR_HOST_URL}"

              withCredentials([string(credentialsId: env.SONAR_CRED, variable: 'SQ_TOKEN')]) {
                bat """
                set SONAR_AUTH_TOKEN=
                set SONAR_TOKEN=
                set SONAR_LOGIN=
                "${sonarScannerHome}\\bin\\sonar-scanner.bat" ^
                  -Dsonar.projectKey=nexus-inventory-system ^
                  -Dsonar.projectName=nexus-inventory-system ^
                  -Dsonar.host.url=%SONAR_HOST_URL% ^
                  -Dsonar.token=%SQ_TOKEN% ^
                  -Dsonar.sources=Backend,frontend-react/src ^
                  -Dsonar.exclusions=**/node_modules/**,**/build/**,**/__pycache__/**,**/*.pyc
                """
              }
            }
          }
        }
      }
    }

    stage('Deploy Frontend to Vercel') {
      steps {
        withCredentials([string(credentialsId: env.VERCEL_CRED, variable: 'VERCEL_TOKEN')]) {
          bat '''
          cd frontend-react
          if not exist .vercel mkdir .vercel
          powershell -NoProfile -Command "$json = '{\"projectId\":\"%VERCEL_PROJECT_ID%\",\"orgId\":\"%VERCEL_ORG_ID%\"}'; Set-Content -Path .vercel\\project.json -Value $json -Encoding ASCII"
          npx --yes vercel deploy --prod --yes --token %VERCEL_TOKEN%
          '''
        }
      }
    }

    stage('Deploy Backend to Railway') {
      steps {
        bat '''
        set RAILWAY_TOKEN=%RAILWAY_TOKEN%
        npx --yes @railway/cli whoami
        npx --yes @railway/cli up -p %RAILWAY_PROJECT% -e %RAILWAY_ENVIRONMENT% -s %RAILWAY_SERVICE% -d -c
        '''
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
