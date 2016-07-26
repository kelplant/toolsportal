<?php
namespace Proservia\GestionReparationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTime;
use Symfony\Component\Validator\Constraints\Date;

/**
 * @ORM\Table(name="edf_repair_tickets")
 * @ORM\Entity()
 */
class Ticket
{
    /** @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /** @var int
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $user;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=false)
     */
    protected $dsp;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=false)
     */
    protected $serial;

    /** @var int
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $site;

    /** @var int
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $product;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=false)
     */
    protected $status;

    /** @var int
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $typePanne;

    /** @var int
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $panne;

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $endOfWarranty;

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $buyMode;

    /** @var string
     * @ORM\Column(type="string", length=250, nullable=false)
     */
    protected $typeWarranty;

    /**
     * @var string
     * @ORM\Column(type="integer", length=1, nullable=true, options={"default":0})
     */
    protected $isArchived;

    /**
     * @var string
     * @ORM\Column(type="text", nullable=true)é
     */
    protected $comment;

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
     * @return Ticket
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param int $user
     * @return Ticket
     */
    public function setUser($user)
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return string
     */
    public function getDsp()
    {
        return $this->dsp;
    }

    /**
     * @param string $dsp
     * @return Ticket
     */
    public function setDsp($dsp)
    {
        $this->dsp = $dsp;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getBuyMode()
    {
        return $this->buyMode;
    }

    /**
     * @param mixed $buyMode
     */
    public function setBuyMode($buyMode)
    {
        $this->buyMode = $buyMode;
    }

    /**
     * @return string
     */
    public function getSerial()
    {
        return $this->serial;
    }

    /**
     * @param string $serial
     * @return Ticket
     */
    public function setSerial($serial)
    {
        $this->serial = $serial;
        return $this;
    }

    /**
     * @return int
     */
    public function getSite()
    {
        return $this->site;
    }

    /**
     * @param int $site
     * @return Ticket
     */
    public function setSite($site)
    {
        $this->site = $site;
        return $this;
    }

    /**
     * @return int
     */
    public function getProduct()
    {
        return $this->product;
    }

    /**
     * @param int $product
     * @return Ticket
     */
    public function setProduct($product)
    {
        $this->product = $product;
        return $this;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param string $status
     * @return Ticket
     */
    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    /**
     * @return int
     */
    public function getTypePanne()
    {
        return $this->typePanne;
    }

    /**
     * @param int $typePanne
     * @return Ticket
     */
    public function setTypePanne($typePanne)
    {
        $this->typePanne = $typePanne;
        return $this;
    }

    /**
     * @return int
     */
    public function getPanne()
    {
        return $this->panne;
    }

    /**
     * @param int $panne
     * @return Ticket
     */
    public function setPanne($panne)
    {
        $this->panne = $panne;
        return $this;
    }

    /**
     * @return Date
     */
    public function getEndOfWarranty()
    {
        return $this->endOfWarranty;
    }

    /**
     * @param Date $endOfWarranty
     * @return Ticket
     */
    public function setEndOfWarranty($endOfWarranty)
    {
        $this->endOfWarranty = $endOfWarranty;
        return $this;
    }

    /**
     * @return string
     */
    public function getTypeWarranty()
    {
        return $this->typeWarranty;
    }

    /**
     * @param string $typeWarranty
     * @return Ticket
     */
    public function setTypeWarranty($typeWarranty)
    {
        $this->typeWarranty = $typeWarranty;
        return $this;
    }

    /**
     * @return string
     */
    public function getIsArchived()
    {
        return $this->isArchived;
    }

    /**
     * @param string $isArchived
     * @return Ticket
     */
    public function setIsArchived($isArchived)
    {
        $this->isArchived = $isArchived;
        return $this;
    }

    /**
     * @return string
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * @param string $comment
     * @return Ticket
     */
    public function setComment($comment)
    {
        $this->comment = $comment;
        return $this;
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
     * @return Ticket
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
        return $this;
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
     * @return Ticket
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}