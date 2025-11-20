# Stage 1: Build Image (Giai đoạn xây dựng)
FROM node:20-alpine AS builder
WORKDIR /app

# Khắc phục lỗi NEXT_PUBLIC_API_URL bị mất:
# 1. Định nghĩa biến build-time argument (ARG)
ARG NEXT_PUBLIC_API_URL
# 2. Đặt giá trị ARG vào biến môi trường (ENV) để nó có sẵn trong lệnh RUN npm run build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Chạy lệnh build Next.js, sử dụng biến NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Production Image (Giai đoạn chạy)
FROM node:20-alpine AS runner
WORKDIR /app

# Sao chép các file cần thiết cho môi trường Production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Thiết lập các biến môi trường Production
ENV NODE_ENV production
ENV PORT 8080 

# 🚨 Đặt lại biến môi trường cho giai đoạn RUN:
# Điều này cho phép bạn ghi đè giá trị API_URL khi triển khai (Flexibility)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL 

EXPOSE 8080

# Lệnh chạy Production (npm start sẽ khởi chạy ứng dụng Next.js đã được build)
CMD ["npm", "start"]