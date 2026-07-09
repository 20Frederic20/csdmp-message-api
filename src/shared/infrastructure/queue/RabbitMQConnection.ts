import amqp, { ChannelModel, Channel } from "amqplib";

export class RabbitMQConnection {
  private static connection: ChannelModel | null = null;
  private static channel: Channel | null = null;
  private static isConnecting = false;

  static async connect(): Promise<void> {
    if (this.connection) return;
    if (this.isConnecting) {
      await this.waitForConnection();
      return;
    }

    this.isConnecting = true;
    const url = process.env.RABBITMQ_URL || "amqp://localhost";
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log("Connected to RabbitMQ");

      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ connection error", err);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        this.handleDisconnect();
      });
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      this.isConnecting = false;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private static async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.connection) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        if (!this.connection) {
          reject(new Error("RabbitMQ connection timeout"));
        } else {
          resolve();
        }
      }, 10000);
    });
  }

  private static handleDisconnect() {
    this.connection = null;
    this.channel = null;
    console.log("Attempting to reconnect to RabbitMQ in 5 seconds...");
    setTimeout(() => {
      this.connect().catch((err) =>
        console.error("Failed to reconnect to RabbitMQ:", err),
      );
    }, 5000);
  }

  static async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }
    return this.channel!;
  }

  static async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.channel = null;
    }
  }
}
