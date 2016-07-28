<?php
namespace Proservia\GestionReparationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTime;

/**
 * @ORM\Table(name="edf_repair_ticket_events_files")
 * @ORM\Entity()
 */
class TicketEventFile
{
    /** @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var int
     * @ORM\Column(type="integer")
     */
    protected $ticketId;

    /** @var int
     * @ORM\Column(type="integer")
     */
    protected $ticketEventId;

    /**
     * @var string
     * @ORM\Column(type="string")
     */
    protected $originalFileName;

    /**
     * @var string
     * @ORM\Column(type="string")
     */
    protected $stockFileName;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $createdAt;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return int
     */
    public function getTicketId()
    {
        return $this->ticketId;
    }

    /**
     * @param int $ticketId
     */
    public function setTicketId($ticketId)
    {
        $this->ticketId = $ticketId;
    }

    /**
     * @return int
     */
    public function getTicketEventId()
    {
        return $this->ticketEventId;
    }

    /**
     * @param int $ticketEventId
     */
    public function setTicketEventId($ticketEventId)
    {
        $this->ticketEventId = $ticketEventId;
    }

    /**
     * @return string
     */
    public function getOriginalFileName()
    {
        return $this->originalFileName;
    }

    /**
     * @param string $originalFileName
     */
    public function setOriginalFileName($originalFileName)
    {
        $this->originalFileName = $originalFileName;
    }

    /**
     * @return string
     */
    public function getStockFileName()
    {
        return $this->stockFileName;
    }

    /**
     * @param string $stockFileName
     */
    public function setStockFileName($stockFileName)
    {
        $this->stockFileName = $stockFileName;
    }

    /**
     * @return DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param DateTime $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * @return DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param DateTime $updatedAt
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
    }
}