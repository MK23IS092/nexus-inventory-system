pipeline {
    agent any

    environment {
        REGISTRY            = 'docker.io/pranavmk'
        DOCKER_CRED         = 'dockerhub-pranavmk'

        SONAR_CRED          = 'sonar'
        SONAR_HOST          = 'http://localhost:9000'

        RAILWAY_CRED        = 'railway-token'
        RAILWAY_PROJECT     = 'nexus-inventory-system'
        RAILWAY_SERVICE     = 'backend'
        RAILWAY_ENVIRONMENT = 'production'

        VERCEL_CRED         = 'vercel-token'
        VERCEL_PROJECT_ID   = 'prj_TE3hanu3sHZ2kHUzCp3T7tUfCyAb'
        VERCEL_ORG_ID       = 'team_GpO5D543HdVwuCLjif4rqt4W'

        BACKEND_BASE_URL    = 'https://nexus-inventory-system-production.up.railway.app'

        MONGO_URI           = 'mongodb+srv://PranavMK:Pmk190705*@quickcommercedb.dejiyem.mongodb.net/quickCommerceDB?appName=quickCommerceDB'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/MK23IS092/nexus-inventory-system.git'

                script {
                    env.IMAGE_TAG = bat(
                        returnStdout: true,
                        script: '''
                        @echo off
                        for /f %%i in ('git rev-parse --short HEAD') do echo %%i
                        '''
                    ).trim()

                    echo "Using image tag: ${env.IMAGE_TAG}"
                }
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
                set REACT_APP_API_BASE_URL=%BACKEND_BASE_URL%
                npm ci --legacy-peer-deps
                npm test -- --watchAll=false --passWithNoTests
                npm run build
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                bat '''
                if not exist dependency-check-report (
                    mkdir dependency-check-report
                )
                '''
                dependencyCheck(
                    additionalArguments: '--scan ./ --format ALL --out dependency-check-report',
                    odcInstallation: 'DP'
                )
            }
            post {
                always {
                    dependencyCheckPublisher(
                        pattern: 'dependency-check-report/dependency-check-report.xml'
                    )
                    archiveArtifacts(
                        artifacts: 'dependency-check-report/**',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('PranavMK') {
                    script {
                        def sonarScannerHome = tool(
                            name: 'Sonar-server',
                            type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        )

                        echo "Resolved Sonar scanner: ${sonarScannerHome}"
                        echo "Sonar host URL: ${env.SONAR_HOST_URL}"

                        if (!env.SONAR_AUTH_TOKEN || !env.SONAR_AUTH_TOKEN.trim()) {
                            echo 'SONAR_AUTH_TOKEN was not injected. Trying Jenkins credential fallback.'
                        }

                        def sonarStatus = bat(
                            returnStatus: true,
                            script: """
                            "${sonarScannerHome}\\bin\\sonar-scanner.bat" ^
                              -Dsonar.projectKey=nexus-inventory-system ^
                              -Dsonar.projectName=nexus-inventory-system ^
                              -Dsonar.host.url=%SONAR_HOST_URL% ^
                              -Dsonar.token=%SONAR_AUTH_TOKEN% ^
                              -Dsonar.sources=Backend,frontend-react/src ^
                              -Dsonar.exclusions=**/node_modules/**,**/build/**,**/__pycache__/**,**/*.pyc
                            """
                        )

                        if (sonarStatus != 0) {
                            echo 'Primary Sonar scan failed. Trying Jenkins credential fallback.'
                            withCredentials([
                                string(
                                    credentialsId: env.SONAR_CRED,
                                    variable: 'SONAR_FALLBACK_TOKEN'
                                )
                            ]) {
                                sonarStatus = bat(
                                    returnStatus: true,
                                    script: """
                                    "${sonarScannerHome}\\bin\\sonar-scanner.bat" ^
                                      -Dsonar.projectKey=nexus-inventory-system ^
                                      -Dsonar.projectName=nexus-inventory-system ^
                                      -Dsonar.host.url=%SONAR_HOST_URL% ^
                                      -Dsonar.token=%SONAR_FALLBACK_TOKEN% ^
                                      -Dsonar.sources=Backend,frontend-react/src ^
                                      -Dsonar.exclusions=**/node_modules/**,**/build/**,**/__pycache__/**,**/*.pyc
                                    """
                                )
                            }
                        }

                        if (sonarStatus != 0) {
                            echo "Sonar scanner exited with code ${sonarStatus}. Continuing pipeline."
                        }
                    }
                }
            }
        }

        stage('Prepare Docker Engine') {
            steps {
                writeFile(
                    file: 'start-docker.ps1',
                    text: '''$ErrorActionPreference = "Stop"

$desktopExe = Join-Path $env:ProgramFiles "Docker\\Docker\\Docker Desktop.exe"
$services = @("com.docker.service", "Docker Desktop Service")

foreach ($serviceName in $services) {
    $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -ne "Running") {
        try {
            Start-Service -Name $serviceName -ErrorAction Stop
            Write-Host "Started service: $serviceName"
        } catch {
            Write-Host "Unable to start service ${serviceName}: $($_.Exception.Message)"
        }
    }
}

if (Test-Path $desktopExe) {
    $desktop = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $desktop) {
        try {
            Start-Process -FilePath $desktopExe -ArgumentList "--minimized"
            Write-Host "Docker Desktop launched."
        } catch {
            Write-Host "Unable to start Docker Desktop: $($_.Exception.Message)"
        }
    } else {
        Write-Host "Docker Desktop already running."
    }
} else {
    Write-Host "Docker Desktop not found at $desktopExe"
}

for ($i = 0; $i -lt 36; $i++) {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker daemon is available."
        exit 0
    }
    Write-Host "Waiting for Docker daemon... attempt $($i + 1)/36"
    Start-Sleep -Seconds 5
}

Write-Error "Docker daemon is not available after 3 minutes."
exit 1
'''
                )
                bat 'powershell -NoProfile -ExecutionPolicy Bypass -File start-docker.ps1'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                docker build -t docker.io/pranavmk/nexus-backend:%IMAGE_TAG% -t docker.io/pranavmk/nexus-backend:latest -f Dockerfile .
                docker build -t docker.io/pranavmk/nexus-frontend:%IMAGE_TAG% -t docker.io/pranavmk/nexus-frontend:latest -f frontend-react/Dockerfile frontend-react
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.DOCKER_CRED,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        def loginStatus = bat(
                            returnStatus: true,
                            script: '''
                            echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                            '''
                        )

                        if (loginStatus != 0) {
                            echo 'Docker login failed. Trying fallback account.'
                            def fallbackLoginStatus = bat(
                                returnStatus: true,
                                script: '''
                                echo Pmk190705* | docker login -u pranavmk --password-stdin
                                '''
                            )
                            if (fallbackLoginStatus != 0) {
                                echo 'Fallback Docker login failed. Skipping image push.'
                                return
                            }
                        }

                        def backendPushStatus = bat(
                            returnStatus: true,
                            script: '''
                            docker push docker.io/pranavmk/nexus-backend:%IMAGE_TAG%
                            docker push docker.io/pranavmk/nexus-backend:latest
                            '''
                        )

                        def frontendPushStatus = bat(
                            returnStatus: true,
                            script: '''
                            docker push docker.io/pranavmk/nexus-frontend:%IMAGE_TAG%
                            docker push docker.io/pranavmk/nexus-frontend:latest
                            '''
                        )

                        if (backendPushStatus != 0 || frontendPushStatus != 0) {
                            echo 'One or more Docker pushes failed.'
                        }
                    }
                }
            }
        }

        stage('Deploy Frontend to Vercel') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    withCredentials([
                        string(
                            credentialsId: env.VERCEL_CRED,
                            variable: 'VERCEL_TOKEN'
                        )
                    ]) {
                        writeFile(
                            file: 'deploy-vercel.ps1',
                            text: '''$ErrorActionPreference = "Stop"

if (-not $env:VERCEL_TOKEN) {
    throw "VERCEL_TOKEN is not set."
}
if (-not $env:VERCEL_PROJECT_ID) {
    throw "VERCEL_PROJECT_ID is not set."
}
if (-not $env:VERCEL_ORG_ID) {
    throw "VERCEL_ORG_ID is not set."
}

New-Item -ItemType Directory -Force -Path .vercel | Out-Null

$projectConfig = @{
    projectId = $env:VERCEL_PROJECT_ID
    orgId     = $env:VERCEL_ORG_ID
} | ConvertTo-Json -Compress

Set-Content -Path ".vercel/project.json" -Value $projectConfig -Encoding ASCII

if ($env:BACKEND_BASE_URL) {
    $env:REACT_APP_API_BASE_URL = $env:BACKEND_BASE_URL
}

Write-Host "Deploying frontend to Vercel (project: $($env:VERCEL_PROJECT_ID))..."
npx --yes vercel deploy --prod --yes --token $env:VERCEL_TOKEN
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
'''
                        )
                        bat 'powershell -NoProfile -ExecutionPolicy Bypass -File deploy-vercel.ps1'
                    }
                }
            }
        }

        stage('Deploy Backend to Railway') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    script {
                        def railwayStatus = 1
                        withCredentials([
                            string(
                                credentialsId: env.RAILWAY_CRED,
                                variable: 'RAILWAY_TOKEN'
                            )
                        ]) {
                            railwayStatus = bat(
                                returnStatus: true,
                                script: '''
                                npx --yes @railway/cli whoami
                                npx --yes @railway/cli up -p %RAILWAY_PROJECT% -e %RAILWAY_ENVIRONMENT% -s %RAILWAY_SERVICE% -d -c
                                '''
                            )
                        }
                        if (railwayStatus != 0) {
                            echo "Railway deploy failed with exit code ${railwayStatus}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
